// whatsapp.service.ts
import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { WhatsappCoexistenciaService } from './whatsapp.coexistencia';
import { WhatsappDatosService } from './whatsapp-datos.service';
import { WhatsappGateway } from './whatsapp.gateway';

import { detalleError, normalizarTelefono, soloDigitos} from './whatsapp.utils';

const ESTADO_STATUS: Record<string, string> = {
    sent: 'enviado',
    delivered: 'entregado',
    read: 'leido',
    failed: 'fallido',
};

// Para no "retroceder" un estado (ej: de leido a entregado)
const RANGO_ESTADO: Record<string, number> = {
    enviado: 1,
    fallido: 2,
    entregado: 3,
    leido: 4,
};

interface SalidaWhatsapp {
    phoneNumberId: string;
    token: string;
    idTrabajador: number | null;
}

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly gateway: WhatsappGateway,
        private readonly coexistencia: WhatsappCoexistenciaService,
        private readonly datos: WhatsappDatosService,
    ) { }

    private get base() {
        return `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION ?? 'v25.0'}`;
    }

    // ═════════════════ Webhook (punto de entrada único) ═════════════════

    async procesarWebhook(body: any): Promise<void> {
        for (const entry of body?.entry ?? []) {
            for (const change of entry?.changes ?? []) {
                try {
                    switch (change.field) {
                        case 'messages':
                            await this.procesarMensajes(change.value);
                            break;
                        case 'smb_message_echoes':
                            await this.coexistencia.procesarEcos(change.value);
                            break;
                        case 'history':
                            await this.coexistencia.procesarHistorial(change.value);
                            break;
                        case 'account_update':
                            await this.coexistencia.procesarCuenta(change.value);
                            break;
                        case 'smb_app_state_sync':
                            this.logger.log('Sync de contactos recibido (sin procesar).');
                            break;
                        default:
                            this.logger.log(`Campo ignorado: ${change.field}`);
                    }
                } catch (e) {
                    // Un error en un cambio no debe tumbar los demás
                    this.logger.error(`Error en "${change.field}": ${(e as Error).message}`);
                }
            }
        }
    }

    private async procesarMensajes(value: any): Promise<void> {
        const phoneNumberId: string | null = value?.metadata?.phone_number_id ?? null;
        const idTrabajador = await this.datos.trabajadorDeNumero(phoneNumberId);

        // 1) Mensajes entrantes del cliente
        for (const m of value?.messages ?? []) {
            if (!m?.id) continue;

            const cliente = soloDigitos(m.from);
            const idLead = await this.datos.leadDeTelefono(cliente);
            const ts = Number(m.timestamp);

            const insertado: any[] = await this.dataSource.query(
                `
                INSERT INTO public.com_whatsapp_mensaje (
                    id_lead, numero_whatsapp, tipo_mensaje, mensaje, wa_message_id,
                    fecha_mensaje, fecha_registro, estado, phone_number_id, id_trabajador
                )
                VALUES ($1, $2, 'entrante', $3, $4, to_timestamp($5), NOW(), 'enviado', $6, $7)
                ON CONFLICT (wa_message_id) DO NOTHING
                RETURNING *
                `,
                [
                    idLead,
                    cliente,
                    this.textoDe(m),
                    m.id,
                    Number.isFinite(ts) && ts > 0 ? ts : Math.floor(Date.now() / 1000),
                    phoneNumberId,
                    idTrabajador,
                ],
            );

            if (insertado.length && idLead) {
                this.gateway.emitirMensaje(idLead, insertado[0]);
            }
        }

        // 2) Estados de mensajes enviados (entregado, leído, fallido)
        for (const s of value?.statuses ?? []) {
            const estado = ESTADO_STATUS[s?.status];
            if (!estado || !s?.id) continue;

            if (estado === 'fallido') {
                this.logger.warn(
                    `Mensaje ${s.id} falló: ${s.errors?.[0]?.code} ${s.errors?.[0]?.title ?? ''}`,
                );
            }

            const filas: Array<{ id_lead: number | null; wa_message_id: string; estado: string }> =
                await this.dataSource.query(
                    `
                    UPDATE public.com_whatsapp_mensaje
                    SET estado = $2
                    WHERE wa_message_id = $1
                      AND (CASE COALESCE(estado, '')
                            WHEN 'enviado'   THEN 1
                            WHEN 'fallido'   THEN 2
                            WHEN 'entregado' THEN 3
                            WHEN 'leido'     THEN 4
                            ELSE 0 END) < $3
                    RETURNING id_lead, wa_message_id, estado
                    `,
                    [s.id, estado, RANGO_ESTADO[estado]],
                );

            for (const f of filas) {
                if (f.id_lead) {
                    this.gateway.emitirEstado(f.id_lead, {
                        wa_message_id: f.wa_message_id,
                        estado: f.estado,
                    });
                }
            }
        }
    }

    // ═════════════════ API para el front ═════════════════

    async listarMensajes(idLead: number) {
        return this.dataSource.query(
            `
            SELECT *
            FROM public.com_whatsapp_mensaje
            WHERE id_lead = $1
            ORDER BY fecha_mensaje ASC, fecha_registro ASC
            `,
            [idLead],
        );
    }

    async enviarMensaje(idLead: number, mensaje: string) {
        const texto = (mensaje ?? '').trim();
        if (!texto) throw new BadRequestException('El mensaje está vacío.');

        const [lead] = await this.dataSource.query(
            `
            SELECT c.telefono
            FROM public.com_leads l
            INNER JOIN public.com_clientes c ON c.id = l.id_cliente
            WHERE l.id = $1
            LIMIT 1
            `,
            [idLead],
        );
        if (!lead?.telefono) {
            throw new NotFoundException('El lead no existe o no tiene teléfono.');
        }

        const para = normalizarTelefono(lead.telefono);

        // Se responde por el mismo número por el que ya conversó este lead
        const [ultimo] = await this.dataSource.query(
            `
            SELECT phone_number_id
            FROM public.com_whatsapp_mensaje
            WHERE id_lead = $1 AND phone_number_id IS NOT NULL
            ORDER BY fecha_mensaje DESC
            LIMIT 1
            `,
            [idLead],
        );
        const salida = await this.resolverSalida(ultimo?.phone_number_id ?? null);

        let waMessageId: string;
        try {
            const { data } = await axios.post(
                `${this.base}/${salida.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: para,
                    type: 'text',
                    text: { body: texto, preview_url: false },
                },
                { headers: { Authorization: `Bearer ${salida.token}` } },
            );
            waMessageId = data?.messages?.[0]?.id;
            if (!waMessageId) throw new Error('Meta no devolvió el id del mensaje.');
        } catch (e) {
            throw new BadGatewayException(`No se pudo enviar el mensaje: ${detalleError(e)}`);
        }

        const [fila] = await this.dataSource.query(
            `
            INSERT INTO public.com_whatsapp_mensaje (
                id_lead, numero_whatsapp, tipo_mensaje, mensaje, wa_message_id,
                fecha_mensaje, fecha_registro, estado, phone_number_id, id_trabajador
            )
            VALUES ($1, $2, 'saliente', $3, $4, NOW(), NOW(), 'enviado', $5, $6)
            ON CONFLICT (wa_message_id) DO NOTHING
            RETURNING *
            `,
            [idLead, para, texto, waMessageId, salida.phoneNumberId, salida.idTrabajador],
        );

        if (fila) this.gateway.emitirMensaje(idLead, fila);
        return fila ?? { wa_message_id: waMessageId, estado: 'enviado' };
    }

    /**
     * Marca como leído el último mensaje entrante del lead (✓✓ azul).
     * Si escribiendo = true, además muestra "escribiendo..." al cliente.
     * No lanza error si falla: es solo un detalle visual.
     */
    async indicadorCliente(idLead: number, escribiendo: boolean) {
        const [ultimo] = await this.dataSource.query(
            `
            SELECT wa_message_id, phone_number_id
            FROM public.com_whatsapp_mensaje
            WHERE id_lead = $1 AND tipo_mensaje = 'entrante'
            ORDER BY fecha_mensaje DESC
            LIMIT 1
            `,
            [idLead],
        );
        if (!ultimo?.wa_message_id) {
            return { ok: false, motivo: 'El lead no tiene mensajes entrantes.' };
        }

        try {
            const salida = await this.resolverSalida(ultimo.phone_number_id ?? null);

            await axios.post(
                `${this.base}/${salida.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: ultimo.wa_message_id,
                    ...(escribiendo ? { typing_indicator: { type: 'text' } } : {}),
                },
                { headers: { Authorization: `Bearer ${salida.token}` } },
            );
            return { ok: true };
        } catch (e) {
            this.logger.warn(`No se pudo enviar el indicador: ${detalleError(e)}`);
            return { ok: false, error: detalleError(e) };
        }
    }

    // ═════════════════ Utilidades ═════════════════

    /**
     * Elige con qué número y token se envía.
     * 1) El asesor conectado por coexistencia dueño de ese phone_number_id.
     * 2) Si no hay, el número global del .env (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_TOKEN).
     */
    private async resolverSalida(phoneNumberId: string | null): Promise<SalidaWhatsapp> {
        if (phoneNumberId) {
            const [fila] = await this.dataSource.query(
                `
                SELECT id_trabajador, phone_number_id, access_token
                FROM public.trabajador_numero_salida
                WHERE phone_number_id = $1
                  AND activo = true
                  AND access_token IS NOT NULL
                LIMIT 1
                `,
                [phoneNumberId],
            );
            if (fila) {
                return {
                    phoneNumberId: fila.phone_number_id,
                    token: fila.access_token,
                    idTrabajador: fila.id_trabajador,
                };
            }
        }

        const idGlobal = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const tokenGlobal = process.env.WHATSAPP_TOKEN;
        if (idGlobal && tokenGlobal) {
            return { phoneNumberId: idGlobal, token: tokenGlobal, idTrabajador: null };
        }

        throw new BadRequestException(
            'No hay un número de WhatsApp conectado para este lead. Conecta al asesor primero.',
        );
    }

    private textoDe(m: any): string | null {
        switch (m?.type) {
            case 'text':
                return m.text?.body ?? null;
            case 'button':
                return m.button?.text ?? null;
            case 'interactive':
                return (
                    m.interactive?.button_reply?.title ??
                    m.interactive?.list_reply?.title ??
                    '[mensaje interactivo]'
                );
            case 'image':
            case 'video':
            case 'document':
                return m[m.type]?.caption ? `[${m.type}] ${m[m.type].caption}` : `[${m.type}]`;
            case 'audio':
            case 'sticker':
            case 'location':
            case 'contacts':
                return `[${m.type}]`;
            default:
                return m?.type ? `[${m.type}]` : null;
        }
    }
}