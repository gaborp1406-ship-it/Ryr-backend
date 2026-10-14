// whatsapp-coexistencia.service.ts
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { WhatsappDatosService } from './whatsapp-datos.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { detalleError, soloDigitos, ultimos9} from './whatsapp.utils';

export interface CompletarOnboardingDto {
    code: string;
    waba_id: string;
    phone_number_id?: string | null;
    id_trabajador: number;
}

const ESTADO_HISTORIAL: Record<string, string> = {
    SENT: 'enviado',
    DELIVERED: 'entregado',
    READ: 'leido',
    PLAYED: 'leido',
    PENDING: 'enviado',
    ERROR: 'fallido',
};

@Injectable()
export class WhatsappCoexistenciaService {
    private readonly logger = new Logger(WhatsappCoexistenciaService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly gateway: WhatsappGateway,
        private readonly datos: WhatsappDatosService,
    ) { }

    // ═════════════════ 0) Registro del asesor ═════════════════

    async registrarAsesor(idTrabajador: number, numero: string) {
        const limpio = soloDigitos(numero);
        if (!idTrabajador || limpio.length < 9) {
            throw new BadRequestException('id_trabajador y numero válidos son obligatorios.');
        }
        const normalizado = limpio.length === 9 ? `51${limpio}` : limpio;

        const [fila] = await this.dataSource.query(
            `
            INSERT INTO public.trabajador_numero_salida (id_trabajador, numero)
            VALUES ($1, $2)
            ON CONFLICT (id_trabajador) DO UPDATE SET numero = EXCLUDED.numero
            RETURNING id_trabajador, numero
            `,
            [idTrabajador, normalizado],
        );
        return fila;
    }

    async estadoAsesor(idTrabajador: number) {
        const [fila] = await this.dataSource.query(
            `
            SELECT id_trabajador, numero, phone_number_id, waba_id,
                   coexistencia, activo, fecha_conexion,
                   (access_token IS NOT NULL) AS tiene_token
            FROM public.trabajador_numero_salida
            WHERE id_trabajador = $1
            `,
            [idTrabajador],
        );
        if (!fila) throw new NotFoundException('El asesor no está registrado.');
        return fila;
    }

    // ═════════════════ 1) Onboarding (lo llama el front tras Embedded Signup) ═════════════════

    async completarOnboarding(dto: CompletarOnboardingDto) {
        const { code, waba_id: wabaId, id_trabajador: idTrabajador } = dto;

        if (!code || !wabaId || !idTrabajador) {
            throw new BadRequestException(
                'Faltan datos: code, waba_id e id_trabajador son obligatorios.',
            );
        }

        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        const version = process.env.WHATSAPP_API_VERSION;

        if (!appId || !appSecret || !version) {
            throw new InternalServerErrorException(
                'Falta META_APP_ID, META_APP_SECRET o WHATSAPP_API_VERSION en el backend.',
            );
        }

        const [asesor] = await this.dataSource.query(
            `SELECT numero FROM public.trabajador_numero_salida WHERE id_trabajador = $1 LIMIT 1`,
            [idTrabajador],
        );

        if (!asesor) {
            throw new BadRequestException(
                'El asesor no tiene fila en trabajador_numero_salida. Regístralo primero con su número.',
            );
        }

        const base = `https://graph.facebook.com/${version}`;

        // Paso 1: canjear el code por el token de negocio (el code dura 30 s)
        let token: string;
        try {
            const { data } = await axios.get(`${base}/oauth/access_token`, {
                params: { client_id: appId, client_secret: appSecret, code },
            });
            token = typeof data === 'string' ? data : data?.access_token;
            if (!token) throw new Error('Meta no devolvió el token.');
        } catch (e) {
            throw new BadRequestException(
                `No se pudo canjear el código de Meta: ${detalleError(e)}`,
            );
        }

        // Paso 2: suscribir la app a los webhooks de la WABA del cliente
        try {
            await axios.post(`${base}/${wabaId}/subscribed_apps`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (e) {
            throw new BadRequestException(
                `No se pudo suscribir la app a la WABA: ${detalleError(e)}`,
            );
        }

        // Paso 3 (registro del número): NO se hace en coexistencia, ya está registrado.

        // Obtener el phone_number_id (en coexistencia el evento solo trae waba_id)
        const phoneNumberId =
            dto.phone_number_id ??
            (await this.buscarPhoneNumberId(wabaId, token, asesor.numero));

        // Verificar que quedó en modo app + API
        let estado: { is_on_biz_app?: boolean; platform_type?: string } = {};
        try {
            const { data } = await axios.get(`${base}/${phoneNumberId}`, {
                params: { fields: 'is_on_biz_app,platform_type' },
                headers: { Authorization: `Bearer ${token}` },
            });
            estado = data;
        } catch (e) {
            this.logger.warn(`No se pudo verificar is_on_biz_app: ${detalleError(e)}`);
        }

        await this.dataSource.query(
            `
            UPDATE public.trabajador_numero_salida
            SET phone_number_id = $2,
                waba_id = $3,
                access_token = $4,
                coexistencia = true,
                activo = true,
                fecha_conexion = NOW()
            WHERE id_trabajador = $1
            `,
            [idTrabajador, phoneNumberId, wabaId, token],
        );

        this.logger.log(
            `Asesor ${idTrabajador} conectado. phone_number_id=${phoneNumberId} is_on_biz_app=${estado.is_on_biz_app} platform=${estado.platform_type}`,
        );

        // Hay 24 h para sincronizar; lo lanzamos ya, sin bloquear la respuesta.
        void this.sincronizarDatos(phoneNumberId, token);

        return {
            ok: true,
            id_trabajador: idTrabajador,
            phone_number_id: phoneNumberId,
            waba_id: wabaId,
            is_on_biz_app: estado.is_on_biz_app ?? null,
            platform_type: estado.platform_type ?? null,
        };
    }

    private async buscarPhoneNumberId(
        wabaId: string,
        token: string,
        numeroAsesor: string,
    ): Promise<string> {
        const version = process.env.WHATSAPP_API_VERSION;

        let numeros: any[];
        try {
            const { data } = await axios.get(
                `https://graph.facebook.com/${version}/${wabaId}/phone_numbers`,
                {
                    params: { fields: 'id,display_phone_number' },
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            numeros = data?.data ?? [];
        } catch (e) {
            throw new BadRequestException(
                `No se pudieron listar los números de la WABA: ${detalleError(e)}`,
            );
        }

        const coincide = numeros.find(
            (n) => ultimos9(n.display_phone_number) === ultimos9(numeroAsesor),
        );
        if (coincide) return coincide.id;

        if (numeros.length === 1) {
            this.logger.warn(
                `El número de Meta (${numeros[0].display_phone_number}) no coincide con el del asesor (${numeroAsesor}); se usa el único disponible.`,
            );
            return numeros[0].id;
        }

        throw new BadRequestException(
            'No se encontró en la WABA un número que coincida con el del asesor.',
        );
    }

    /**
     * Tras el onboarding hay 24 h para sincronizar contactos e historial.
     * Cada paso solo puede hacerse UNA vez por conexión.
     */
    private async sincronizarDatos(phoneNumberId: string, token: string) {
        const version = process.env.WHATSAPP_API_VERSION;

        for (const tipo of ['smb_app_state_sync', 'history']) {
            try {
                const { data } = await axios.post(
                    `https://graph.facebook.com/${version}/${phoneNumberId}/smb_app_data`,
                    { messaging_product: 'whatsapp', sync_type: tipo },
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                this.logger.log(`[SYNC ${tipo}] aceptado. request_id=${data?.request_id}`);
            } catch (e) {
                this.logger.warn(`[SYNC ${tipo}] falló: ${detalleError(e)}`);
            }
        }
    }

    // ═════════════════ 2) Webhook: mensajes enviados desde la app del asesor ═════════════════

    async procesarEcos(value: any): Promise<void> {
        const phoneNumberId: string | null = value?.metadata?.phone_number_id ?? null;
        const idTrabajador = await this.datos.trabajadorDeNumero(phoneNumberId);

        for (const eco of value?.message_echoes ?? []) {
            const cliente = soloDigitos(eco.to);
            if (!cliente || !eco.id) continue;

            const idLead = await this.datos.leadDeTelefono(cliente);
            const ts = Number(eco.timestamp);

            const insertado: any[] = await this.dataSource.query(
                `
                INSERT INTO public.com_whatsapp_mensaje (
                    id_lead, numero_whatsapp, tipo_mensaje, mensaje, wa_message_id,
                    fecha_mensaje, fecha_registro, estado, phone_number_id, id_trabajador
                )
                VALUES ($1, $2, 'saliente', $3, $4, to_timestamp($5), NOW(), 'enviado', $6, $7)
                ON CONFLICT (wa_message_id) DO NOTHING
                RETURNING *
                `,
                [
                    idLead,
                    cliente,
                    eco.type === 'text' ? eco.text?.body ?? null : `[${eco.type ?? 'mensaje'}]`,
                    eco.id,
                    Number.isFinite(ts) && ts > 0 ? ts : Math.floor(Date.now() / 1000),
                    phoneNumberId,
                    idTrabajador,
                ],
            );

            if (insertado.length && idLead) {
                this.gateway.emitirMensaje(idLead, insertado[0]);
            }

            this.logger.log(
                `Eco de la app procesado. Lead: ${idLead ?? 'sin asociar'} | Asesor: ${idTrabajador ?? 'desconocido'}`,
            );
        }
    }

    // ═════════════════ 3) Webhook: historial sincronizado (hasta 6 meses) ═════════════════

    async procesarHistorial(value: any): Promise<void> {
        const phoneNumberId: string | null = value?.metadata?.phone_number_id ?? null;
        const numeroNegocio = ultimos9(value?.metadata?.display_phone_number);
        const idTrabajador = await this.datos.trabajadorDeNumero(phoneNumberId);

        for (const bloque of value?.history ?? []) {
            const err = bloque?.errors?.[0];
            if (err) {
                // 2593109 = el asesor decidió NO compartir su historial
                this.logger.warn(`[HISTORIAL] ${err.code}: ${err.title}`);
                continue;
            }

            const meta = bloque?.metadata;
            if (meta) {
                this.logger.log(
                    `[HISTORIAL] fase ${meta.phase} bloque ${meta.chunk_order} progreso ${meta.progress}%`,
                );
            }

            for (const hilo of bloque?.threads ?? []) {
                const cliente = soloDigitos(hilo.id);
                const idLead = await this.datos.leadDeTelefono(cliente);

                for (const m of hilo.messages ?? []) {
                    if (!m?.id) continue;

                    const saliente = ultimos9(m.from) === numeroNegocio;
                    const ts = Number(m.timestamp);

                    await this.dataSource.query(
                        `
                        INSERT INTO public.com_whatsapp_mensaje (
                            id_lead, numero_whatsapp, tipo_mensaje, mensaje, wa_message_id,
                            fecha_mensaje, fecha_registro, estado, phone_number_id, id_trabajador
                        )
                        VALUES ($1, $2, $3, $4, $5, to_timestamp($6), NOW(), $7, $8, $9)
                        ON CONFLICT (wa_message_id) DO NOTHING
                        `,
                        [
                            idLead,
                            cliente,
                            saliente ? 'saliente' : 'entrante',
                            m.type === 'text' ? m.text?.body ?? null : `[${m.type ?? 'mensaje'}]`,
                            m.id,
                            Number.isFinite(ts) && ts > 0 ? ts : Math.floor(Date.now() / 1000),
                            saliente
                                ? ESTADO_HISTORIAL[m.history_context?.status] ?? 'enviado'
                                : 'enviado',
                            phoneNumberId,
                            idTrabajador,
                        ],
                    );
                }
            }
        }
    }

    // ═════════════════ 4) Webhook: cambios de cuenta (desconexión) ═════════════════

    async procesarCuenta(value: any): Promise<void> {
        const evento = value?.event;

        if (evento === 'PARTNER_REMOVED') {
            const numero = ultimos9(value?.phone_number);
            const razon = value?.disconnection_info?.reason ?? 'desconocida';

            this.logger.warn(
                `Número ${value?.phone_number} desconectado de la API. Razón: ${razon}`,
            );

            if (numero) {
                await this.dataSource.query(
                    `
                    UPDATE public.trabajador_numero_salida
                    SET activo = false, coexistencia = false
                    WHERE RIGHT(regexp_replace(numero, '\\D', '', 'g'), 9) = $1
                    `,
                    [numero],
                );
            }
            return;
        }

        this.logger.log(`account_update: ${evento ?? 'sin evento'}`);
    }
}