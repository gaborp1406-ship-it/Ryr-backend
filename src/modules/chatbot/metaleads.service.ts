import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { DataSource } from 'typeorm';
import { BotService } from './bot.service';
import { BotWaService } from './botwaservice'; // ajusta la ruta si tu archivo se llama distinto

interface EventoLead {
    leadgen_id: string;
    form_id: string;
    page_id: string;
    ad_id: string | null;
}

interface CamposFormulario {
    nombreCompleto?: string;
    nombres?: string;
    apellidos?: string;
    telefono?: string;
    email?: string;
    dni?: string;
    dormitorios?: string;
    presupuesto?: string;
}

/**
 * Formularios de anuncios de Meta (Lead Ads) -> ARIA
 *   Meta (webhook leadgen) -> pide los datos del lead a la Graph API -> deja la sesión de ARIA con
 *   lo que el cliente ya llenó -> envía la plantilla de WhatsApp -> el cliente responde -> ARIA continúa
 *   solo con lo que falta.
 */
@Injectable()
export class MetaLeadsService {
    private readonly logger = new Logger(MetaLeadsService.name);
    private avisoFirma = false;

    constructor(
        private readonly dataSource: DataSource,
        private readonly bot: BotService,
        private readonly botWa: BotWaService,
    ) { }

    private get graphUrl(): string {
        return `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || process.env.WA_API_VERSION || 'v21.0'}`;
    }

    // ───────────────────────── seguridad del webhook ─────────────────────────

    tokenValido(mode?: string, token?: string): boolean {
        const esperado = process.env.META_VERIFY_TOKEN;
        return mode === 'subscribe' && !!esperado && token === esperado;
    }

    /**
     * Verifica X-Hub-Signature-256 con el secreto de la app.
     * (Aunque alguien enviara un aviso falso, los datos del lead siempre se vuelven a pedir a Meta.)
     */
    firmaValida(raw?: Buffer, firma?: string): boolean {
        const secreto = process.env.META_APP_SECRET;
        if (!secreto || !raw) {
            if (!this.avisoFirma) {
                this.logger.warn('No se verifica la firma de Meta: falta META_APP_SECRET o rawBody (usa NestFactory.create(AppModule, { rawBody: true }))');
                this.avisoFirma = true;
            }
            return true;
        }
        if (!firma) return false;
        const esperado = 'sha256=' + createHmac('sha256', secreto).update(raw).digest('hex');
        const a = Buffer.from(firma);
        const b = Buffer.from(esperado);
        return a.length === b.length && timingSafeEqual(a, b);
    }

    // ───────────────────────── entrada ─────────────────────────

    async procesarWebhook(body: any) {
        if (body?.object !== 'page') return;

        for (const entry of body?.entry ?? []) {
            for (const change of entry?.changes ?? []) {
                if (change?.field !== 'leadgen' || !change?.value?.leadgen_id) continue;
                const v = change.value;
                await this.procesarLead({
                    leadgen_id: String(v.leadgen_id),
                    form_id: String(v.form_id ?? ''),
                    page_id: String(v.page_id ?? entry?.id ?? ''),
                    ad_id: v.ad_id ? String(v.ad_id) : null,
                }).catch((e) => this.logger.error(`Lead ${v.leadgen_id}: ${e?.message}`, e?.stack));
            }
        }
    }

    // ───────────────────────── flujo de un lead ─────────────────────────

    private async procesarLead(ev: EventoLead) {
        // Meta reintenta avisos: cada leadgen_id se procesa una sola vez
        const ins = await this.dataSource.query(
            `INSERT INTO meta_leads (leadgen_id, form_id, page_id, ad_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (leadgen_id) DO NOTHING
             RETURNING id`,
            [ev.leadgen_id, ev.form_id, ev.page_id, ev.ad_id],
        );
        if (!ins.length) {
            this.logger.log(`Lead ${ev.leadgen_id} ya procesado: se ignora`);
            return;
        }
        const id = ins[0].id;

        try {
            const lead = await this.obtenerLead(ev.leadgen_id);
            const campos = this.mapear(lead?.field_data ?? []);
            const idProyecto = await this.proyectoDelFormulario(ev.form_id);
            const extra = {
                created_time: lead?.created_time,
                ad_name: lead?.ad_name,
                campaign_name: lead?.campaign_name,
                platform: lead?.platform,
                email: campos.email,
            };

            const pre = await this.bot.precargarLeadFormulario({ ...campos, telefono: campos.telefono ?? '', idProyecto });
            if (!pre) {
                await this.marcar(id, 'SIN_TELEFONO', 'El formulario no trae un teléfono válido', lead, extra);
                return;
            }
            if (!idProyecto) {
                this.logger.warn(`Formulario ${ev.form_id} sin proyecto en bot_formulario_proyecto: ARIA preguntará el proyecto`);
            }

            await this.marcar(id, 'SESION_LISTA', null, lead, extra, pre.telefono, pre.datos.nombres ?? campos.nombreCompleto);

            await this.botWa.enviarPlantilla(
                pre.telefono,
                process.env.WA_TEMPLATE_FORMULARIO || 'bienvenida_formulario',
                process.env.WA_TEMPLATE_IDIOMA || 'es',
                [pre.primerNombre || 'cliente', pre.proyecto ?? 'nuestros proyectos'],
            );
            await this.marcar(id, 'PLANTILLA_ENVIADA', null);
            this.logger.log(`Lead ${ev.leadgen_id} (${pre.telefono}) -> plantilla enviada`);
        } catch (e: any) {
            const msg = e?.response?.data?.error?.message ?? e?.message ?? 'error desconocido';
            this.logger.error(`Lead ${ev.leadgen_id}: ${msg}`);
            await this.marcar(id, 'ERROR', String(msg).slice(0, 500));
        }
    }

    /** Datos del lead desde la Graph API (con el token de la página) */
    private async obtenerLead(leadgenId: string): Promise<any> {
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        if (!token) throw new Error('Falta META_PAGE_ACCESS_TOKEN en el .env');

        const res = await axios.get(`${this.graphUrl}/${leadgenId}`, {
            params: {
                access_token: token,
                fields: 'id,created_time,field_data,ad_id,ad_name,campaign_name,form_id,platform',
            },
            timeout: 15000,
        });
        return res.data;
    }

    private async proyectoDelFormulario(formId: string): Promise<number | null> {
        const rows = await this.dataSource.query(
            `SELECT id_proyecto FROM bot_formulario_proyecto WHERE form_id = $1`,
            [formId],
        );
        return rows[0]?.id_proyecto ? Number(rows[0].id_proyecto) : null;
    }

    // ───────────────────────── mapeo de campos ─────────────────────────

    private clave(nombre: string): string {
        return String(nombre ?? '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '_');
    }

    /** Convierte los campos del formulario (estándar y preguntas personalizadas) a los datos de ARIA */
    private mapear(fieldData: { name: string; values: string[] }[]): CamposFormulario {
        const out: CamposFormulario = {};

        for (const f of fieldData ?? []) {
            const k = this.clave(f?.name);
            const v = String(f?.values?.[0] ?? '').replace(/_/g, ' ').trim();
            if (!v) continue;

            if (k === 'full_name' || k === 'nombre_completo') out.nombreCompleto = v;
            else if (k === 'first_name' || k === 'nombre' || k === 'nombres') out.nombres = v;
            else if (k === 'last_name' || k === 'apellido' || k === 'apellidos') out.apellidos = v;
            else if (k === 'email' || k === 'correo') out.email = v;
            else if (k === 'phone_number' || /phone|telefono|celular|whatsapp/.test(k)) out.telefono = v;
            else if (/dni|documento/.test(k)) out.dni = v;
            else if (/dormitorio|habitacion|cuarto/.test(k)) out.dormitorios = v;
            else if (/presupuesto/.test(k)) out.presupuesto = v;
        }
        return out;
    }

    // ───────────────────────── registro ─────────────────────────

    private async marcar(
        id: number | string,
        estado: string,
        error: string | null,
        lead?: any,
        extra?: Record<string, unknown>,
        telefono?: string,
        nombre?: string,
    ) {
        await this.dataSource.query(
            `UPDATE meta_leads
                SET estado = $2,
                    error = $3,
                    telefono = COALESCE($4, telefono),
                    nombre = COALESCE($5, nombre),
                    field_data = COALESCE($6::jsonb, field_data),
                    extra = COALESCE($7::jsonb, extra)
              WHERE id = $1`,
            [
                id,
                estado,
                error,
                telefono ?? null,
                nombre ?? null,
                lead?.field_data ? JSON.stringify(lead.field_data) : null,
                extra ? JSON.stringify(extra) : null,
            ],
        );
    }
}