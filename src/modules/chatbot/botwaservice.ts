import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { BotService } from './bot.service';
import type { Salida, RespuestaBot, LeadPayload } from './bot.service';
import { LeadService } from '../leads/leads.service';

/**
 * Conecta el número de WhatsApp del BOT (el de R&R) con BotService (la IA "ARIA").
 *   cliente -> webhook -> BotService -> respuestas por WhatsApp
 *   al completar -> en horario: API crear lead (uno por proyecto); fuera de horario: tabla bot_reservaciones
 *   al derivar -> resumen de la conversación con IA, impreso SOLO en consola (el cliente no lo recibe)
 */
@Injectable()
export class BotWaService {
    private readonly logger = new Logger(BotWaService.name);

    /** wamid ya procesados (Meta reintenta webhooks si tardas en responder) */
    private readonly vistos = new Map<string, number>();
    /** Cola por teléfono: si el cliente manda 2 mensajes seguidos, se procesan en orden */
    private readonly colas = new Map<string, Promise<void>>();
    /** Estados de entrega recibidos (wamid -> delivered/read/failed), por si llegan antes de esperarlos */
    private readonly estados = new Map<string, string>();
    /** Envíos que esperan su confirmación de entrega (wamid -> resolver) */
    private readonly esperas = new Map<string, (estado: string) => void>();

    constructor(
        private readonly bot: BotService,
        private readonly leadService: LeadService,
    ) { }

    private get botPhoneId(): string | undefined {
        return process.env.WA_BOT_PHONE_NUMBER_ID;
    }

    private get graphUrl(): string {
        return `https://graph.facebook.com/${process.env.WA_API_VERSION || 'v21.0'}`;
    }

    private get headers() {
        return { Authorization: `Bearer ${process.env.WA_TOKEN}` };
    }

    // ───────────────────────── entrada ─────────────────────────

    /** Procesa SOLO los eventos del número del bot; el resto lo maneja WhatsappService */
    async procesarWebhook(body: any) {
        if (!this.botPhoneId) return;

        for (const entry of body?.entry ?? []) {
            for (const change of entry?.changes ?? []) {
                const value = change?.value;
                if (change?.field !== 'messages') continue; // ignora echoes y otros campos
                if (value?.metadata?.phone_number_id !== this.botPhoneId) continue;

                for (const msg of value.messages ?? []) {
                    // Con username de WhatsApp, Meta puede no mandar el teléfono: se usa el BSUID
                    const id = this.idRemitente(msg, value);
                    if (!id) {
                        this.logger.warn(`Mensaje sin identificador de remitente: ${JSON.stringify(msg).slice(0, 300)}`);
                        continue;
                    }
                    if (!this.esTelefono(id)) {
                        this.logger.log(`Cliente sin teléfono visible (BSUID ${id}); from=${msg?.from ?? '-'} wa_id=${value?.contacts?.[0]?.wa_id ?? '-'}`);
                    }
                    this.encolar(id, () => this.procesarMensaje(msg, id));
                }

                // Estados del bot (enviado/entregado/leído/fallido): se usan para esperar a que el video llegue
                for (const st of value.statuses ?? []) {
                    if (st?.id && st?.status) this.registrarEstado(String(st.id), String(st.status));
                }
            }
        }
    }

    private encolar(clave: string, tarea: () => Promise<void>) {
        const previa = this.colas.get(clave) ?? Promise.resolve();
        const siguiente = previa
            .then(tarea)
            .catch((e) => this.logger.error(`Bot (${clave}): ${e?.message}`, e?.stack));
        this.colas.set(clave, siguiente);
        void siguiente.finally(() => {
            if (this.colas.get(clave) === siguiente) this.colas.delete(clave);
        });
    }

    /**
     * Identificador del cliente: SIEMPRE el teléfono si llega en cualquier campo (from o contacts.wa_id);
     * solo si no hay teléfono visible se usa el BSUID (cliente con username).
     */
    private idRemitente(msg: any, value: any): string {
        const contacto = value?.contacts?.[0];
        const telefono = [msg?.from, contacto?.wa_id]
            .map((x) => String(x ?? '').trim().replace(/^\+/, ''))
            .find((x) => this.esTelefono(x));
        if (telefono) return telefono;

        return String(
            msg?.from_user_id ?? msg?.user_id ?? contacto?.user_id ?? msg?.from ?? contacto?.wa_id ?? '',
        ).trim();
    }

    private registrarEstado(wamid: string, estado: string) {
        if (!['delivered', 'read', 'failed'].includes(estado)) return;
        const espera = this.esperas.get(wamid);
        if (espera) {
            this.esperas.delete(wamid);
            espera(estado);
            return;
        }
        this.estados.set(wamid, estado);
        if (this.estados.size > 1000) {
            const primero = this.estados.keys().next().value;
            if (primero !== undefined) this.estados.delete(primero);
        }
    }

    /** Espera a que Meta confirme la entrega del mensaje (o 'timeout' si tarda demasiado) */
    private esperarEntrega(wamid: string, timeoutMs = 30000): Promise<string> {
        const ya = this.estados.get(wamid);
        if (ya) {
            this.estados.delete(wamid);
            return Promise.resolve(ya);
        }
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this.esperas.delete(wamid);
                resolve('timeout');
            }, timeoutMs);
            this.esperas.set(wamid, (estado) => {
                clearTimeout(timer);
                resolve(estado);
            });
        });
    }

    private esTelefono(id: string): boolean {
        return /^\d{9,15}$/.test(id);
    }

    private yaProcesado(id: string): boolean {
        const ahora = Date.now();
        for (const [k, t] of this.vistos) if (ahora - t > 3_600_000) this.vistos.delete(k);
        if (this.vistos.has(id)) return true;
        this.vistos.set(id, ahora);
        return false;
    }

    // ───────────────────────── flujo ─────────────────────────

    private async procesarMensaje(msg: any, id: string) {
        if (!msg?.id || this.yaProcesado(msg.id)) return;

        const phoneId = this.botPhoneId!;
        const to = id; // teléfono o BSUID

        this.marcarLeido(phoneId, msg.id); // sin await: no bloquea

        const texto = this.extraerTexto(msg);
        if (!texto) {
            await this.enviar(phoneId, to, {
                tipo: 'texto',
                texto: 'Por el momento solo puedo leer mensajes de texto. ¿Podría escribirlo, por favor?',
            });
            return;
        }

        const r: RespuestaBot = await this.bot.procesarMensaje(to, texto);

        for (const m of r.mensajes as Salida[]) {
            const wamid = await this.enviar(phoneId, to, m);

            // El video tarda más en llegar que un texto: se espera su entrega para que
            // el mensaje siguiente no le gane y se respete el orden
            if (m.tipo === 'video' && wamid) {
                const estado = await this.esperarEntrega(wamid);
                if (estado === 'timeout') {
                    this.logger.warn(`El video a ${to} no confirmó entrega en 30 s; se continúa con el siguiente mensaje`);
                } else if (estado === 'failed' && m.caption) {
                    await this.enviar(phoneId, to, { tipo: 'texto', texto: m.caption });
                }
            }
        }

        if (r.accion === 'derivar' || r.accion === 'derivar_incompleto') {
            const resultados = await this.derivar(to, r);
            // Sin await: el resumen con IA no debe retrasar los mensajes del cliente
            void this.imprimirResumen(to, r, resultados);
        }
    }

    private extraerTexto(msg: any): string {
        switch (msg.type) {
            case 'text': return msg.text?.body ?? '';
            case 'button': return msg.button?.text ?? '';
            case 'interactive':
                return msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title ?? '';
            default: return '';
        }
    }

    // ───────────────────────── resumen en consola (el cliente NO lo recibe) ─────────────────────────

    private async imprimirResumen(telefono: string, r: RespuestaBot, resultados: string[]) {
        try {
            const resumen = await this.bot.resumirConversacion(r.historial ?? [], r.datos);
            const tipo = r.accion === 'derivar' ? 'Datos completos' : 'Derivado antes de completar (pidió asesor)';
            const omitidos = r.datos?.omitidos?.length ? r.datos.omitidos.join(', ') : '-';

            this.logger.log(
                [
                    '',
                    '══════════════ RESUMEN DE CONVERSACIÓN ══════════════',
                    `Teléfono : ${telefono}`,
                    `Resultado: ${tipo}`,
                    `No quiso dar: ${omitidos}`,
                    `Leads    : ${resultados.join(' | ') || '-'}`,
                    '─────────────────────────────────────────────────────',
                    resumen,
                    '═════════════════════════════════════════════════════',
                    '',
                ].join('\n'),
            );
        } catch (e: any) {
            this.logger.error(`No se pudo imprimir el resumen (${telefono}): ${e?.message}`);
        }
    }

    // ───────────────────────── envío a Meta ─────────────────────────

    private marcarLeido(phoneId: string, wamid: string) {
        axios
            .post(
                `${this.graphUrl}/${phoneId}/messages`,
                { messaging_product: 'whatsapp', status: 'read', message_id: wamid },
                { headers: this.headers, timeout: 10000 },
            )
            .catch(() => undefined);
    }

    private async enviar(phoneId: string, to: string, m: Salida): Promise<string | undefined> {
        // Teléfono -> "to"; BSUID (cliente con username) -> "recipient"
        const destino = this.esTelefono(to) ? { to } : { recipient: to };
        const base = { messaging_product: 'whatsapp', recipient_type: 'individual', ...destino };
        const post = (payload: Record<string, any>) =>
            axios.post(`${this.graphUrl}/${phoneId}/messages`, { ...base, ...payload }, {
                headers: this.headers,
                timeout: 20000,
            });

        let wamid: string | undefined;
        try {
            const res = m.tipo === 'texto'
                ? await post({ type: 'text', text: { body: m.texto, preview_url: false } })
                : await post({ type: 'video', video: { link: m.url, caption: m.caption } });
            wamid = res?.data?.messages?.[0]?.id;
        } catch (e: any) {
            const err = e?.response?.data?.error ?? e?.message;
            this.logger.error(`Error enviando ${m.tipo} a ${to}: ${JSON.stringify(err)}`);

            // Si falla el video (link no público, >16 MB, etc.) al menos va el texto
            if (m.tipo === 'video' && m.caption) {
                await post({ type: 'text', text: { body: m.caption } }).catch(() => undefined);
            }
            return undefined;
        }
        return wamid;
    }

    /**
     * Plantilla de WhatsApp para iniciar la conversación con un lead de formulario de Meta
     * (el cliente no escribió primero, así que solo se puede con una plantilla aprobada).
     * Lanza error si Meta la rechaza.
     */
    async enviarPlantilla(to: string, plantilla: string, idioma: string, parametros: string[]): Promise<void> {
        const phoneId = this.botPhoneId;
        if (!phoneId) throw new Error('Falta WA_BOT_PHONE_NUMBER_ID en el .env');

        try {
            await axios.post(
                `${this.graphUrl}/${phoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to,
                    type: 'template',
                    template: {
                        name: plantilla,
                        language: { code: idioma },
                        components: parametros.length
                            ? [{ type: 'body', parameters: parametros.map((text) => ({ type: 'text', text })) }]
                            : [],
                    },
                },
                { headers: this.headers, timeout: 20000 },
            );
        } catch (e: any) {
            const err = e?.response?.data?.error;
            throw new Error(err ? `${err.message} (code ${err.code})` : e?.message);
        }
    }

    // ───────────────────────── derivar al asesor ─────────────────────────

    /**
     * Dentro del horario de atención (hora de Perú: L-S 9:00-20:00, Dom 9:30-18:30) crea un lead por proyecto.
     * Fuera de horario, o si no hay teléfono / proyecto / falla el CRM, guarda el caso en bot_reservaciones
     * para derivarlo manualmente después. NO se envía saludo del asesor: él escribe por su cuenta.
     * Devuelve una línea por proyecto para el resumen de consola.
     */
    private async derivar(idWhatsapp: string, r: RespuestaBot): Promise<string[]> {
        const payloads: LeadPayload[] = r.lead_payloads ?? [];
        const resultados: string[] = [];
        const enHorario = this.bot.enHorarioAtencion();

        // Los leads de formulario de Meta pueden tener su propia fuente en el CRM
        const idFuente = Number(
            r.datos?.origen === 'formulario'
                ? process.env.BOT_ID_FUENTE_FORMULARIO || process.env.BOT_ID_FUENTE
                : process.env.BOT_ID_FUENTE,
        );
        const usuario = Number(process.env.BOT_USUARIO_CREACION);
        const configurado = !!idFuente && !!usuario;
        if (enHorario && !configurado) {
            this.logger.error('Faltan BOT_ID_FUENTE o BOT_USUARIO_CREACION en el .env: los casos van a bot_reservaciones');
        }

        const guardar = async (p: LeadPayload, motivo: string, etiqueta: string) => {
            try {
                await this.bot.guardarReservacion(idWhatsapp, p, r.datos, r.historial ?? [], motivo, r.accion);
                this.logger.log(`bot_reservaciones (${etiqueta}) <- ${motivo}`);
                resultados.push(`${etiqueta}: guardado en bot_reservaciones (${motivo})`);
            } catch (e: any) {
                // Que el caso no se pierda: queda completo en el log
                this.logger.error(
                    `No se pudo guardar en bot_reservaciones (${motivo}): ${e?.message} | payload=${JSON.stringify(p)} | datos=${JSON.stringify(r.datos)}`,
                    e?.stack,
                );
                resultados.push(`${etiqueta}: ERROR al guardar en bot_reservaciones`);
            }
        };

        for (const p of payloads) {
            const etiqueta = p.proyecto_nombre ?? 'Sin proyecto';

            if (!enHorario) { await guardar(p, 'FUERA_DE_HORARIO', etiqueta); continue; }
            if (!this.esTelefono(String(p.telefono ?? ''))) { await guardar(p, 'SIN_TELEFONO', etiqueta); continue; }
            if (!p.id_proyecto) { await guardar(p, 'SIN_PROYECTO', etiqueta); continue; }
            if (!configurado) { await guardar(p, 'ERROR_CRM', etiqueta); continue; }

            const data: Parameters<LeadService['crearLead']>[0] = {
                id_asesor: 7,
                id_proyecto: Number(p.id_proyecto),
                nombre_cliente:
                    [p.nombres, p.apellidos].filter(Boolean).join(' ').trim() || 'Cliente WhatsApp',
                dni_cliente: p.numero_documento ?? null,
                telefono_cliente: String(p.telefono).replace(/\D/g, '').slice(-9), // 9 dígitos, como en el CRM
                id_fuente: idFuente,
                usuario_creacion: usuario,
            };

            let result: any;
            try {
                result = await this.leadService.crearLead(data);
            } catch (e: any) {
                this.logger.error(`crearLead falló (${etiqueta}): ${e?.message} | data=${JSON.stringify(data)}`, e?.stack);
                await guardar(p, 'ERROR_CRM', etiqueta);
                continue;
            }

            this.logger.log(`crearLead (${etiqueta}) -> accion=${result?.accion} id_lead=${result?.id_lead ?? '-'}`);
            resultados.push(`${etiqueta}: ${result?.accion ?? 'sin respuesta'}${result?.id_lead ? ` (lead ${result.id_lead})` : ''}`);
        }

        return resultados;
    }
}