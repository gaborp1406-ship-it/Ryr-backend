// whatsapp.service.ts
import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { createReadStream, promises as fs } from 'fs';
import { basename, extname, join } from 'path';
import { DataSource } from 'typeorm';

/** Archivo recibido por multer (memoria) */
export interface ArchivoSubido {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

interface MediaGuardada {
    ruta?: string | null;
    url?: string | null;
    mime?: string | null;
    nombre?: string | null;
}

const MB = 1024 * 1024;

/** Tipos que WhatsApp permite enviar y cómo se clasifican */
const TIPOS_PERMITIDOS: Record<string, 'image' | 'video' | 'document'> = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'video/mp4': 'video',
    'video/3gpp': 'video',
    'application/pdf': 'document',
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
    'application/vnd.ms-excel': 'document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
    'application/vnd.ms-powerpoint': 'document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
    'text/plain': 'document',
};

/** Límites en MB (WhatsApp permite hasta 100 MB en documentos; aquí se limita a lo que acepta el controller) */
const LIMITE_MB = { image: 5, video: 16, document: 25 };

const EXT_POR_MIME: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/3gpp': '.3gp',
    'audio/ogg': '.ogg',
    'audio/mpeg': '.mp3',
    'audio/mp4': '.m4a',
    'audio/aac': '.aac',
    'audio/amr': '.amr',
    'application/pdf': '.pdf',
};

interface ContextoLead {
    id_lead: string;
    id_cliente: string;
    id_asesor: string;
    telefono: string;
    id_numero_salida: string;
    phone_number_id: string;
}

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    // ───────────────────────── helpers ─────────────────────────

    private get graphUrl(): string {
        return `https://graph.facebook.com/${process.env.WA_API_VERSION || 'v21.0'}`;
    }

    /** "+51 961 872 715" | "961872715" -> "51961872715" */
    private normalizarTelefono(tel: string): string {
        const digitos = (tel || '').replace(/\D/g, '');
        if (digitos.length === 9 && digitos.startsWith('9')) return `51${digitos}`;
        return digitos;
    }

    /** Obtiene lead + teléfono del cliente + número de salida del asesor */
    private async obtenerContexto(idLead: number): Promise<ContextoLead> {
        const rows = await this.dataSource.query(
            `SELECT l.id AS id_lead, l.id_cliente, l.id_asesor, c.telefono,
                    n.id AS id_numero_salida, n.phone_number_id
               FROM com_leads l
               JOIN com_clientes c ON c.id = l.id_cliente
          LEFT JOIN trabajador_numero_salida n
                 ON n.id_trabajador = l.id_asesor AND n.activo = true
              WHERE l.id = $1`,
            [idLead],
        );
        const ctx = rows[0];
        if (!ctx) throw new NotFoundException('Lead no encontrado');
        if (!ctx.id_asesor) throw new BadRequestException('El lead no tiene asesor asignado');
        if (!ctx.phone_number_id) {
            throw new BadRequestException('El asesor no tiene un número de WhatsApp configurado');
        }
        if (!ctx.telefono) throw new BadRequestException('El cliente no tiene teléfono');
        return ctx;
    }

    private async guardarMensaje(p: {
        idLead: number | string;
        idNumeroSalida: number | string | null;
        direccion: 'ENTRANTE' | 'SALIENTE';
        tipo: string;
        contenido: string;
        waMessageId?: string | null;
        estado: string;
        error?: string | null;
        usuario?: number | null;
        media?: MediaGuardada;
    }) {
        const rows = await this.dataSource.query(
            `INSERT INTO com_lead_mensajes
                (id_lead, id_numero_salida, direccion, tipo, contenido,
                 wa_message_id, estado, error, usuario_creacion,
                 media_ruta, media_url, media_mime, media_nombre)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
             ON CONFLICT (wa_message_id) DO NOTHING
             RETURNING id, id_lead, direccion, tipo, contenido, estado, error, fecha_creacion,
                       media_mime, media_nombre, media_url,
                       (media_ruta IS NOT NULL) AS tiene_archivo`,
            [
                p.idLead, p.idNumeroSalida, p.direccion, p.tipo, p.contenido,
                p.waMessageId ?? null, p.estado, p.error ?? null, p.usuario ?? null,
                p.media?.ruta ?? null, p.media?.url ?? null,
                p.media?.mime ?? null, p.media?.nombre ?? null,
            ],
        );
        return rows[0];
    }

    /** Llama a Meta y devuelve el wamid. Traduce los errores más comunes. */
    private async enviarAMeta(phoneNumberId: string, payload: Record<string, any>): Promise<string> {
        try {
            const { data } = await axios.post(
                `${this.graphUrl}/${phoneNumberId}/messages`,
                { messaging_product: 'whatsapp', recipient_type: 'individual', ...payload },
                {
                    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` },
                    timeout: 15000,
                },
            );
            return data?.messages?.[0]?.id;
        } catch (e: any) {
            const err = e?.response?.data?.error;
            this.logger.error(`Error Meta: ${JSON.stringify(err ?? e.message)}`);

            // 131047 = pasaron más de 24h sin que el cliente escriba
            if (err?.code === 131047) {
                throw new BadRequestException(
                    'Pasaron más de 24 horas desde el último mensaje del cliente. Debes enviar una plantilla aprobada.',
                );
            }
            // 131030 = número no está en la lista permitida (modo prueba)
            if (err?.code === 131030) {
                throw new BadRequestException(
                    'El número del cliente no está en la lista de destinatarios permitidos (modo prueba).',
                );
            }
            throw new BadGatewayException(err?.message || 'No se pudo enviar el mensaje por WhatsApp');
        }
    }

    // ───────────────────────── enviar ─────────────────────────

    async enviarTexto(idLead: number, texto: string, usuario?: number) {
        if (!texto?.trim()) throw new BadRequestException('El mensaje está vacío');
        const ctx = await this.obtenerContexto(idLead);

        let wamid: string;
        try {
            wamid = await this.enviarAMeta(ctx.phone_number_id, {
                to: this.normalizarTelefono(ctx.telefono),
                type: 'text',
                text: { body: texto, preview_url: true },
            });
        } catch (e: any) {
            // Guardamos el intento fallido para que el asesor lo vea en el chat
            await this.guardarMensaje({
                idLead, idNumeroSalida: ctx.id_numero_salida, direccion: 'SALIENTE',
                tipo: 'text', contenido: texto, estado: 'FALLIDO',
                error: e?.message, usuario,
            });
            throw e;
        }

        return this.guardarMensaje({
            idLead, idNumeroSalida: ctx.id_numero_salida, direccion: 'SALIENTE',
            tipo: 'text', contenido: texto, waMessageId: wamid,
            estado: 'ENVIADO', usuario,
        });
    }

    /** Para iniciar conversación o escribir pasadas las 24h (plantilla aprobada en Meta) */
    async enviarPlantilla(
        idLead: number,
        nombrePlantilla: string,
        idioma = 'es',
        parametros: string[] = [],
        usuario?: number,
    ) {
        if (!nombrePlantilla) throw new BadRequestException('Falta el nombre de la plantilla');
        const ctx = await this.obtenerContexto(idLead);

        const template: Record<string, any> = {
            name: nombrePlantilla,
            language: { code: idioma },
        };
        if (parametros.length) {
            template.components = [{
                type: 'body',
                parameters: parametros.map((p) => ({ type: 'text', text: p })),
            }];
        }

        const wamid = await this.enviarAMeta(ctx.phone_number_id, {
            to: this.normalizarTelefono(ctx.telefono),
            type: 'template',
            template,
        });

        const resumen = `[Plantilla: ${nombrePlantilla}]${parametros.length ? ' ' + parametros.join(' | ') : ''}`;
        return this.guardarMensaje({
            idLead, idNumeroSalida: ctx.id_numero_salida, direccion: 'SALIENTE',
            tipo: 'template', contenido: resumen, waMessageId: wamid,
            estado: 'ENVIADO', usuario,
        });
    }

    /**
     * Envía la plantilla de saludo con datos del lead:
     * {{1}} cliente · {{2}} asesor · {{3}} empresa (según el proyecto del lead)
     */
    async enviarSaludo(idLead: number, usuario?: number) {
        const rows = await this.dataSource.query(
            `SELECT c.nombres        AS cliente_nombres,
                    t.nombre         AS asesor_nombre,
                    t.apellido       AS asesor_apellido,
                    e.nombre_abrev   AS empresa_abrev,
                    e.razon_social   AS empresa_razon_social
               FROM com_leads l
               JOIN com_clientes c ON c.id = l.id_cliente
          LEFT JOIN per_trabajador t ON t.id = l.id_asesor
          LEFT JOIN LATERAL (
                    SELECT ge.nombre_abrev, ge.razon_social
                      FROM gen_empresa_proyecto gep
                      JOIN gen_empresa ge ON ge.id = gep.idempresa
                     WHERE gep.idproyecto = l.id_proyecto
                       AND gep.estado = 1
                       AND ge.estado = 1
                  ORDER BY gep.id
                     LIMIT 1
                  ) e ON true
              WHERE l.id = $1`,
            [idLead],
        );
        const r = rows[0];
        if (!r) throw new NotFoundException('Lead no encontrado');

        // Meta rechaza parámetros con saltos de línea, tabs o 4+ espacios seguidos
        const limpiar = (s?: string | null) =>
            (s ?? '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
        const primera = (s?: string | null) => limpiar(s).split(' ')[0] || '';

        // Variables del saludo: {{1}} cliente · {{2}} asesor · {{3}} empresa
        const cliente = primera(r.cliente_nombres) || 'cliente';
        const asesor = limpiar(`${primera(r.asesor_nombre)} ${primera(r.asesor_apellido)}`);
        const empresa = limpiar(
            r.empresa_abrev || r.empresa_razon_social || process.env.WA_EMPRESA_DEFAULT,
        );

        if (!asesor) {
            throw new BadRequestException('El asesor del lead no tiene nombre registrado');
        }
        if (!empresa) {
            throw new BadRequestException(
                'No se encontró la empresa del lead (revisa su id_proyecto y la tabla gen_empresa_proyecto)',
            );
        }

        return this.enviarPlantilla(
            idLead,
            process.env.WA_PLANTILLA_SALUDO || 'saludo_asesor_solicitud',
            process.env.WA_PLANTILLA_IDIOMA || 'es',
            [cliente, asesor, empresa],
            usuario,
        );
    }

    // ───────────────────── archivos (imagen / video / PDF) ─────────────────────

    /** Envía un archivo en medio del chat (solo con la ventana de 24 h abierta) */
    async enviarArchivo(idLead: number, archivo: ArchivoSubido, caption?: string, usuario?: number) {
        if (!archivo?.buffer?.length) throw new BadRequestException('No se recibió ningún archivo');

        const tipo = TIPOS_PERMITIDOS[archivo.mimetype];
        if (!tipo) {
            throw new BadRequestException(
                'Tipo de archivo no permitido. Usa JPG, PNG, MP4, PDF, Word, Excel, PowerPoint o TXT.',
            );
        }
        if (archivo.size > LIMITE_MB[tipo] * MB) {
            const nombreTipo = tipo === 'image' ? 'imágenes' : tipo === 'video' ? 'videos' : 'documentos';
            throw new BadRequestException(`El archivo supera el máximo de ${LIMITE_MB[tipo]} MB para ${nombreTipo}`);
        }

        const ctx = await this.obtenerContexto(idLead);
        const texto = (caption ?? '').trim();
        const ruta = await this.guardarArchivo(archivo.buffer, archivo.originalname);
        const media: MediaGuardada = { ruta, mime: archivo.mimetype, nombre: archivo.originalname };

        let wamid: string;
        try {
            const mediaId = await this.subirAMeta(ctx.phone_number_id, archivo);
            const contenidoMedia: Record<string, any> = { id: mediaId };
            if (texto) contenidoMedia.caption = texto;
            if (tipo === 'document') contenidoMedia.filename = archivo.originalname;

            wamid = await this.enviarAMeta(ctx.phone_number_id, {
                to: this.normalizarTelefono(ctx.telefono),
                type: tipo,
                [tipo]: contenidoMedia,
            });
        } catch (e: any) {
            await this.guardarMensaje({
                idLead, idNumeroSalida: ctx.id_numero_salida, direccion: 'SALIENTE',
                tipo, contenido: texto, estado: 'FALLIDO', error: e?.message, usuario, media,
            });
            throw e;
        }

        return this.guardarMensaje({
            idLead, idNumeroSalida: ctx.id_numero_salida, direccion: 'SALIENTE',
            tipo, contenido: texto, waMessageId: wamid, estado: 'ENVIADO', usuario, media,
        });
    }

    /** Sube el archivo a Meta y devuelve el media id (requiere Node 18+ por fetch/FormData) */
    private async subirAMeta(phoneNumberId: string, archivo: ArchivoSubido): Promise<string> {
        const form = new FormData();
        form.append('messaging_product', 'whatsapp');
        form.append('type', archivo.mimetype);
        form.append(
            'file',
            new Blob([new Uint8Array(archivo.buffer)], { type: archivo.mimetype }),
            archivo.originalname,
        );

        const res = await fetch(`${this.graphUrl}/${phoneNumberId}/media`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` },
            body: form,
        });
        const data: any = await res.json().catch(() => ({}));
        if (!res.ok || !data?.id) {
            this.logger.error(`Error subiendo archivo a Meta: ${JSON.stringify(data)}`);
            throw new BadGatewayException(data?.error?.message || 'No se pudo subir el archivo a WhatsApp');
        }
        return data.id;
    }

    /** Descarga un archivo que mandó el cliente (Meta exige el token también en la descarga) */
    private async descargarMediaEntrante(mediaId: string): Promise<{ buffer: Buffer; mime: string }> {
        const headers = { Authorization: `Bearer ${process.env.WA_TOKEN}` };
        const { data: meta } = await axios.get(`${this.graphUrl}/${mediaId}`, { headers, timeout: 15000 });
        const { data } = await axios.get(meta.url, {
            headers,
            responseType: 'arraybuffer',
            timeout: 60000,
        });
        return { buffer: Buffer.from(data), mime: meta.mime_type };
    }

    private get dirMedia(): string {
        return process.env.WA_MEDIA_DIR || join(process.cwd(), 'storage', 'whatsapp');
    }

    /** Guarda el archivo en disco con un nombre generado y devuelve ese nombre */
    private async guardarArchivo(buffer: Buffer, nombreOriginal: string): Promise<string> {
        await fs.mkdir(this.dirMedia, { recursive: true });
        const ext = extname(nombreOriginal || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
        const nombre = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
        await fs.writeFile(join(this.dirMedia, nombre), buffer);
        return nombre;
    }

    /** Para que el front muestre o descargue el archivo de un mensaje */
    async obtenerArchivo(idMensaje: number) {
        const rows = await this.dataSource.query(
            `SELECT media_ruta, media_mime, media_nombre FROM com_lead_mensajes WHERE id = $1`,
            [idMensaje],
        );
        const m = rows[0];
        if (!m?.media_ruta) throw new NotFoundException('Archivo no encontrado');

        const ruta = join(this.dirMedia, basename(m.media_ruta)); // basename evita rutas fuera de la carpeta
        try {
            await fs.access(ruta);
        } catch {
            throw new NotFoundException('El archivo ya no está en el servidor');
        }
        return {
            stream: createReadStream(ruta),
            mime: m.media_mime || 'application/octet-stream',
            nombre: m.media_nombre || m.media_ruta,
        };
    }

    // ───────────────────── conversación del lead ─────────────────────

    async obtenerConversacion(idLead: number, limite = 200) {
        const mensajes = await this.dataSource.query(
            `SELECT * FROM (
                SELECT id, direccion, tipo, contenido, estado, error, fecha_creacion,
                       media_mime, media_nombre, media_url,
                       (media_ruta IS NOT NULL) AS tiene_archivo
                  FROM com_lead_mensajes
                 WHERE id_lead = $1
              ORDER BY fecha_creacion DESC, id DESC
                 LIMIT $2
             ) t ORDER BY fecha_creacion ASC, id ASC`,
            [idLead, limite],
        );

        // ¿Se puede escribir texto libre? (cliente escribió en las últimas 24h)
        const ventana = await this.dataSource.query(
            `SELECT COALESCE(
                MAX(fecha_creacion) > timezone('America/Lima', now()) - interval '24 hours',
                false) AS abierta
               FROM com_lead_mensajes
              WHERE id_lead = $1 AND direccion = 'ENTRANTE'`,
            [idLead],
        );

        return { ventana_abierta: ventana[0]?.abierta ?? false, mensajes };
    }

    // ───────────────────── webhook (Meta -> CRM) ─────────────────────

    async procesarWebhook(body: any) {
        for (const entry of body?.entry ?? []) {
            for (const change of entry?.changes ?? []) {
                const value = change?.value;
                if (!value) continue;
                const phoneNumberId = value.metadata?.phone_number_id;
                const nombrePerfil = value.contacts?.[0]?.profile?.name;

                // Mensajes que el asesor escribió desde la app de WhatsApp Business del celular
                if (change.field === 'smb_message_echoes') {
                    for (const echo of value.message_echoes ?? value.messages ?? []) {
                        try {
                            await this.procesarEcho(phoneNumberId, echo);
                        } catch (e: any) {
                            this.logger.error(`Error procesando echo: ${e.message}`, e.stack);
                        }
                    }
                    continue;
                }

                for (const msg of value.messages ?? []) {
                    try {
                        await this.procesarEntrante(phoneNumberId, msg, nombrePerfil);
                    } catch (e: any) {
                        this.logger.error(`Error procesando mensaje entrante: ${e.message}`, e.stack);
                    }
                }
                for (const st of value.statuses ?? []) {
                    try {
                        await this.procesarEstado(st);
                    } catch (e: any) {
                        this.logger.error(`Error procesando estado: ${e.message}`, e.stack);
                    }
                }
            }
        }
    }

    private extraerContenido(msg: any): { tipo: string; contenido: string } {
        const tipo = msg.type;
        switch (tipo) {
            case 'text':
                return { tipo, contenido: msg.text?.body ?? '' };
            case 'button':
                return { tipo, contenido: msg.button?.text ?? '' };
            case 'interactive':
                return {
                    tipo,
                    contenido: msg.interactive?.button_reply?.title
                        ?? msg.interactive?.list_reply?.title ?? '',
                };
            case 'image':
            case 'video':
            case 'document':
                return { tipo, contenido: `[${tipo}] ${msg[tipo]?.caption ?? ''}`.trim() };
            case 'audio':
            case 'sticker':
                return { tipo, contenido: `[${tipo}]` };
            case 'location':
                return { tipo, contenido: `[ubicación] ${msg.location?.latitude},${msg.location?.longitude}` };
            default:
                return { tipo: tipo ?? 'unknown', contenido: `[${tipo ?? 'mensaje no soportado'}]` };
        }
    }

    private async procesarEntrante(phoneNumberId: string, msg: any, nombrePerfil?: string) {
        // 1) ¿A qué asesor pertenece el número que recibió el mensaje?
        const numeros = await this.dataSource.query(
            `SELECT id, id_trabajador FROM trabajador_numero_salida WHERE phone_number_id = $1`,
            [phoneNumberId],
        );
        const numero = numeros[0];
        if (!numero) {
            this.logger.warn(`phone_number_id ${phoneNumberId} no está asociado a ningún asesor`);
            return;
        }

        // 2) Buscar (o crear) el lead de ese cliente con ese asesor
        const idLead = await this.buscarOCrearLead(numero.id_trabajador, msg.from, nombrePerfil);

        // 3) Guardar el mensaje (si trae archivo, se descarga de Meta y se guarda en el servidor)
        const { tipo, contenido } = this.extraerContenido(msg);
        let texto = contenido;
        let media: MediaGuardada | undefined;

        if (['image', 'video', 'document', 'audio', 'sticker'].includes(tipo)) {
            const info = msg[tipo];
            texto = info?.caption ?? '';
            try {
                const { buffer, mime } = await this.descargarMediaEntrante(info.id);
                const nombre = info?.filename || `${tipo}${EXT_POR_MIME[mime] ?? ''}`;
                const ruta = await this.guardarArchivo(buffer, nombre);
                media = { ruta, mime, nombre };
            } catch (e: any) {
                this.logger.error(`No se pudo descargar el archivo entrante: ${e.message}`);
                texto = texto || `[${tipo}]`;
            }
        }

        await this.guardarMensaje({
            idLead,
            idNumeroSalida: numero.id,
            direccion: 'ENTRANTE',
            tipo,
            contenido: texto,
            waMessageId: msg.id,
            estado: 'RECIBIDO',
            media,
        });
    }

    private async buscarOCrearLead(idAsesor: number | string, telefonoWa: string, nombrePerfil?: string): Promise<string> {
        const ultimos9 = this.normalizarTelefono(telefonoWa).slice(-9);

        // Lead activo existente de ese cliente con ese asesor
        const leads = await this.dataSource.query(
            `SELECT l.id
               FROM com_leads l
               JOIN com_clientes c ON c.id = l.id_cliente
              WHERE l.id_asesor = $1
                AND l.estado = 1
                AND RIGHT(regexp_replace(COALESCE(c.telefono,''), '\\D', '', 'g'), 9) = $2
           ORDER BY l.id DESC
              LIMIT 1`,
            [idAsesor, ultimos9],
        );
        if (leads[0]) return leads[0].id;

        // Cliente existente (sin lead con este asesor) o nuevo
        const clientes = await this.dataSource.query(
            `SELECT id FROM com_clientes
              WHERE RIGHT(regexp_replace(COALESCE(telefono,''), '\\D', '', 'g'), 9) = $1
              ORDER BY id DESC LIMIT 1`,
            [ultimos9],
        );
        let idCliente = clientes[0]?.id;
        if (!idCliente) {
            const nuevo = await this.dataSource.query(
                `INSERT INTO com_clientes (nombres, telefono) VALUES ($1, $2) RETURNING id`,
                [nombrePerfil ?? null, this.normalizarTelefono(telefonoWa)],
            );
            idCliente = nuevo[0].id;
        }

        const nuevoLead = await this.dataSource.query(
            `INSERT INTO com_leads (id_cliente, id_asesor) VALUES ($1, $2) RETURNING id`,
            [idCliente, idAsesor],
        );
        return nuevoLead[0].id;
    }

    /**
     * Mensaje que el asesor envió desde la app del celular (Coexistence).
     * Solo se guarda si ya existe un lead de ese cliente con ese asesor:
     * no se crean leads por cada chat personal del celular.
     */
    private async procesarEcho(phoneNumberId: string, echo: any) {
        const numeros = await this.dataSource.query(
            `SELECT id, id_trabajador FROM trabajador_numero_salida WHERE phone_number_id = $1`,
            [phoneNumberId],
        );
        const numero = numeros[0];
        if (!numero) {
            this.logger.warn(`Echo: phone_number_id ${phoneNumberId} no está asociado a ningún asesor`);
            return;
        }

        const ultimos9 = this.normalizarTelefono(echo.to).slice(-9);
        const leads = await this.dataSource.query(
            `SELECT l.id
               FROM com_leads l
               JOIN com_clientes c ON c.id = l.id_cliente
              WHERE l.id_asesor = $1
                AND l.estado = 1
                AND RIGHT(regexp_replace(COALESCE(c.telefono,''), '\\D', '', 'g'), 9) = $2
           ORDER BY l.id DESC
              LIMIT 1`,
            [numero.id_trabajador, ultimos9],
        );
        if (!leads[0]) {
            this.logger.debug(`Echo hacia ${echo.to}: no hay lead de ese cliente con el asesor, se ignora`);
            return;
        }

        const { tipo, contenido } = this.extraerContenido(echo);
        await this.guardarMensaje({
            idLead: leads[0].id,
            idNumeroSalida: numero.id,
            direccion: 'SALIENTE',
            tipo,
            contenido,
            waMessageId: echo.id,
            estado: 'ENVIADO',
        });
    }

    /** Actualiza ✓ enviado / ✓✓ entregado / ✓✓ azul leído / fallido */
    private async procesarEstado(st: any) {
        const mapa: Record<string, string> = {
            sent: 'ENVIADO',
            delivered: 'ENTREGADO',
            read: 'LEIDO',
            failed: 'FALLIDO',
        };
        const estado = mapa[st.status];
        if (!estado) return;

        const error = st.errors?.[0]
            ? `${st.errors[0].code}: ${st.errors[0].title ?? st.errors[0].message ?? ''}`
            : null;

        // No retrocede el estado (ej. 'delivered' llegando después de 'read')
        await this.dataSource.query(
            `UPDATE com_lead_mensajes
                SET estado = $1::text,
                    error = $2,
                    fecha_estado = timezone('America/Lima', now())
              WHERE wa_message_id = $3
                AND direccion = 'SALIENTE'
                AND COALESCE(array_position(ARRAY['ENVIADO','ENTREGADO','LEIDO']::text[], estado::text), 0)
                 <= COALESCE(array_position(ARRAY['ENVIADO','ENTREGADO','LEIDO']::text[], $1::text), 99)`,
            [estado, error, st.id],
        );
    }
}