// campaniamasiva.service.ts
//
// MIGRACIÓN SQL NECESARIA (ejecutar una sola vez antes de desplegar):
//   1) Buscar el nombre de la constraint única actual:
//        SELECT conname, pg_get_constraintdef(oid)
//          FROM pg_constraint
//         WHERE conrelid = 'com_campania_respuesta'::regclass AND contype = 'u';
//   2) Reemplazarla (ajusta el nombre del DROP al que te salió):
//        ALTER TABLE com_campania_respuesta
//          DROP CONSTRAINT com_campania_respuesta_id_campania_telefono_key;
//        ALTER TABLE com_campania_respuesta
//          ADD CONSTRAINT com_campania_respuesta_camp_tel_tipo_key
//          UNIQUE (id_campania, telefono, tipo);
//
import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';

export interface DestinatarioDto {
    telefono: string;
    nombre?: string;
    /** Campos extra para usar en las variables: { proyecto: "Alameda", ... } */
    datos?: Record<string, string>;
}

export interface CrearCampaniaDto {
    nombre: string;
    plantilla: string;
    idioma?: string;
    /** Una entrada por variable {{1}}, {{2}}... Admite {nombre}, {primer_nombre} y {campo_de_datos} */
    parametros?: string[];
    header?: { tipo: 'image' | 'video' | 'document'; url: string };
    programada_para?: string; // ISO
    destinatarios?: DestinatarioDto[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class CampaniaMasivaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CampaniaMasivaService.name);
    private readonly corriendo = new Set<number>();
    private timer?: NodeJS.Timeout;
    /** Ids de mensajes entrantes ya atendidos (Meta reintenta los webhooks y puede repetirlos) */
    private readonly mensajesProcesados = new Set<string>();
    /** Teléfono -> última vez que se le agradeció su asistencia (para no repetir el mensaje) */
    private readonly agradecidos = new Map<string, number>();

    constructor(private readonly dataSource: DataSource) { }

    // ───────────────────────── configuración ─────────────────────────

    private get phoneId(): string {
        const id = process.env.WA_BOTMASIVA_PHONE_NUMBER_ID;
        if (!id) throw new BadRequestException('Falta WA_BOTMASIVA_PHONE_NUMBER_ID en el .env');
        return id;
    }
    private get graphUrl() {
        return `https://graph.facebook.com/${process.env.WA_API_VERSION || 'v21.0'}`;
    }
    private get headers() {
        return { Authorization: `Bearer ${process.env.WA_TOKEN}` };
    }
    /** Mensajes por segundo (Cloud API admite hasta 80; arranca bajo) */
    private get mps(): number {
        return Math.max(1, Number(process.env.CAMPANIA_MPS) || 15);
    }
    private get horaIni(): number { return Number(process.env.CAMPANIA_HORA_INI ?? 9); }
    private get horaFin(): number { return Number(process.env.CAMPANIA_HORA_FIN ?? 20); }

    // ───────────────────────── ciclo de vida ─────────────────────────

    async onModuleInit() {
        try {
            // Lo que quedó "ENVIANDO" al caerse el servidor no se reenvía solo (evita duplicados)
            await this.dataSource.query(
                `UPDATE com_campania_destinatario
                    SET estado='FALLIDO', error='Interrumpido por reinicio: verificar antes de reintentar'
                  WHERE estado='ENVIANDO'`,
            );
            const activas = await this.dataSource.query(`SELECT id FROM com_campania WHERE estado='EN_CURSO'`);
            for (const c of activas) void this.correr(Number(c.id));
        } catch (e: any) {
            this.logger.error(`No se pudo reanudar campañas (¿ejecutaste el SQL?): ${e.message}`);
        }
        // Revisa cada 30 s si hay campañas programadas para iniciar
        this.timer = setInterval(() => void this.revisarProgramadas(), 30_000);
    }

    onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    private async revisarProgramadas() {
        try {
            const rows = await this.dataSource.query(
                `SELECT id FROM com_campania WHERE estado='PROGRAMADA' AND programada_para <= now()`,
            );
            for (const c of rows) await this.iniciar(Number(c.id)).catch((e) =>
                this.logger.error(`No se pudo iniciar campaña ${c.id}: ${e.message}`));
        } catch { /* tablas aún no creadas */ }
    }

    // ───────────────────────── Meta: plantillas ─────────────────────────

    /** Plantillas aprobadas de tu WABA (requiere WA_WABA_ID) */
    async plantillas() {
        const waba = process.env.WA_WABA_ID;
        if (!waba) throw new BadRequestException('Falta WA_WABA_ID en el .env');
        try {
            const { data } = await axios.get(`${this.graphUrl}/${waba}/message_templates`, {
                headers: this.headers,
                params: { status: 'APPROVED', limit: 200, fields: 'name,language,category,components' },
                timeout: 15000,
            });
            return (data?.data ?? []).map((t: any) => ({
                nombre: t.name,
                idioma: t.language,
                categoria: t.category,
                componentes: t.components,
            }));
        } catch (e: any) {
            throw new BadGatewayException(e?.response?.data?.error?.message || 'No se pudo leer las plantillas de Meta');
        }
    }

    // ───────────────────────── campañas ─────────────────────────

    async crear(dto: CrearCampaniaDto, usuario?: number) {
        if (!dto?.nombre?.trim()) throw new BadRequestException('Falta el nombre de la campaña');
        if (!dto?.plantilla?.trim()) throw new BadRequestException('Falta la plantilla');
        if (dto.header && !['image', 'video', 'document'].includes(dto.header.tipo)) {
            throw new BadRequestException('Header inválido');
        }
        const programada = dto.programada_para ? new Date(dto.programada_para) : null;
        if (programada && isNaN(programada.getTime())) throw new BadRequestException('Fecha programada inválida');

        const rows = await this.dataSource.query(
            `INSERT INTO com_campania
                (nombre, plantilla, idioma, parametros, header_tipo, header_url, estado, programada_para, usuario_creacion)
             VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9)
             RETURNING id`,
            [
                dto.nombre.trim(), dto.plantilla.trim(), dto.idioma || 'es',
                JSON.stringify(dto.parametros ?? []),
                dto.header?.tipo ?? null, dto.header?.url ?? null,
                programada ? 'PROGRAMADA' : 'BORRADOR', programada, usuario ?? null,
            ],
        );
        const id = Number(rows[0].id);
        const carga = dto.destinatarios?.length ? await this.agregarDestinatarios(id, dto.destinatarios) : null;
        return { ...(await this.detalle(id)), carga };
    }

    async listar() {
        return this.dataSource.query(
            `SELECT c.id, c.nombre, c.plantilla, c.estado, c.programada_para, c.fecha_inicio, c.fecha_fin, c.fecha_creacion,
                    COUNT(d.id)::int                                         AS total,
                    COUNT(*) FILTER (WHERE d.estado IN ('ENVIADO','ENTREGADO','LEIDO'))::int AS enviados,
                    COUNT(*) FILTER (WHERE d.estado IN ('ENTREGADO','LEIDO'))::int          AS entregados,
                    COUNT(*) FILTER (WHERE d.estado = 'LEIDO')::int                         AS leidos,
                    COUNT(*) FILTER (WHERE d.estado = 'FALLIDO')::int                       AS fallidos,
                    COUNT(*) FILTER (WHERE d.estado = 'EXCLUIDO')::int                      AS excluidos,
                    COUNT(*) FILTER (WHERE d.respondio)::int                                AS respondieron
               FROM com_campania c
          LEFT JOIN com_campania_destinatario d ON d.id_campania = c.id
           GROUP BY c.id
           ORDER BY c.id DESC`,
        );
    }

    async detalle(id: number) {
        const rows = await this.dataSource.query(`SELECT * FROM com_campania WHERE id=$1`, [id]);
        if (!rows[0]) throw new NotFoundException('Campaña no encontrada');
        const conteo = await this.dataSource.query(
            `SELECT estado, COUNT(*)::int AS n FROM com_campania_destinatario WHERE id_campania=$1 GROUP BY estado`,
            [id],
        );
        const resp = await this.dataSource.query(
            `SELECT COUNT(*)::int AS n FROM com_campania_destinatario WHERE id_campania=$1 AND respondio`,
            [id],
        );
        const porEstado: Record<string, number> = {};
        let total = 0;
        for (const c of conteo) { porEstado[c.estado] = c.n; total += c.n; }
        return { ...rows[0], total, por_estado: porEstado, respondieron: resp[0]?.n ?? 0 };
    }

    async destinatarios(id: number, estado?: string, pagina = 1, limite = 50) {
        const off = (Math.max(1, pagina) - 1) * limite;
        const filtros = estado ? `AND estado = $4` : '';
        const params: any[] = [id, limite, off];
        if (estado) params.push(estado.toUpperCase());
        return this.dataSource.query(
            `SELECT id, telefono, nombre, estado, error, fecha_envio, fecha_estado, respondio, fecha_respuesta
               FROM com_campania_destinatario
              WHERE id_campania=$1 ${filtros}
           ORDER BY id LIMIT $2 OFFSET $3`,
            params,
        );
    }

    /**
     * Respuestas clasificadas de una campaña: confirmaron, piden info y no quieren nada.
     * Un mismo teléfono puede aparecer con más de un tipo (p. ej. INFO y luego BAJA):
     * cada tipo es una fila y cuenta en su propio total del resumen.
     */
    async respuestas(id: number) {
        await this.detalle(id); // 404 si no existe
        const items = await this.dataSource.query(
            `SELECT r.id, r.telefono, d.nombre, r.tipo, r.mensaje, r.fecha
               FROM com_campania_respuesta r
          LEFT JOIN com_campania_destinatario d ON d.id = r.id_destinatario
              WHERE r.id_campania = $1
           ORDER BY r.fecha DESC
              LIMIT 5000`,
            [id],
        );
        const resumen = { CONFIRMA: 0, INFO: 0, BAJA: 0 };
        for (const i of items) resumen[i.tipo as keyof typeof resumen]++;
        return { resumen, items };
    }

    /**
     * Uso interno: lo llama crear() al cargar los destinatarios.
     * Los números que están en la lista de exclusión SÍ se guardan en la campaña,
     * pero como EXCLUIDO: se ven en el detalle y nunca se les envía.
     */
    private async agregarDestinatarios(id: number, lista: DestinatarioDto[]) {
        const camp = await this.dataSource.query(`SELECT estado FROM com_campania WHERE id=$1`, [id]);
        if (!camp[0]) throw new NotFoundException('Campaña no encontrada');
        if (['COMPLETADA', 'CANCELADA'].includes(camp[0].estado)) {
            throw new BadRequestException('La campaña ya terminó');
        }

        // Normaliza, quita inválidos y repetidos
        const vistos = new Map<string, DestinatarioDto>();
        let invalidos = 0;
        for (const d of lista ?? []) {
            const tel = this.normalizarTelefono(d?.telefono);
            if (!tel) { invalidos++; continue; }
            if (!vistos.has(tel)) vistos.set(tel, d);
        }

        // Separa a quienes pidieron no recibir mensajes
        const tels = [...vistos.keys()];
        const optout = tels.length
            ? await this.dataSource.query(`SELECT telefono FROM wa_optout WHERE telefono = ANY($1::text[])`, [tels])
            : [];
        const bloqueados = new Set<string>(optout.map((o: any) => o.telefono));
        const permitidos = tels.filter((t) => !bloqueados.has(t));
        const enLista = tels.filter((t) => bloqueados.has(t));

        const insertar = async (telefonos: string[], excluidos: boolean) => {
            // Valores fijos (no vienen del usuario), por eso van como literales
            const cols = excluidos ? ', estado, error' : '';
            const vals = excluidos ? `, 'EXCLUIDO', 'En lista de exclusión'` : '';
            let n = 0;
            for (let i = 0; i < telefonos.length; i += 1000) {
                const chunk = telefonos.slice(i, i + 1000);
                const nombres = chunk.map((t) => (vistos.get(t)!.nombre ?? '').trim().slice(0, 150));
                const datos = chunk.map((t) => JSON.stringify(vistos.get(t)!.datos ?? {}));
                const ins = await this.dataSource.query(
                    `INSERT INTO com_campania_destinatario (id_campania, telefono, nombre, datos${cols})
                     SELECT $1, x.t, NULLIF(x.n,''), x.d::jsonb${vals}
                       FROM unnest($2::text[], $3::text[], $4::text[]) AS x(t, n, d)
                     ON CONFLICT (id_campania, telefono) DO NOTHING
                     RETURNING id`,
                    [id, chunk, nombres, datos],
                );
                n += ins.length;
            }
            return n;
        };

        const agregados = await insertar(permitidos, false);
        const excluidos = await insertar(enLista, true);

        return {
            recibidos: lista?.length ?? 0,
            agregados,                       // quedan PENDIENTE (se enviarán)
            invalidos,
            excluidos_por_baja: excluidos,   // quedan EXCLUIDO (visibles, no se envían)
            repetidos: permitidos.length - agregados + ((lista?.length ?? 0) - invalidos - vistos.size),
        };
    }

    // ───────────────────────── control ─────────────────────────

    async iniciar(id: number) {
        const c = await this.detalle(id);
        if (!['BORRADOR', 'PROGRAMADA', 'PAUSADA'].includes(c.estado)) {
            throw new BadRequestException(`No se puede iniciar una campaña en estado ${c.estado}`);
        }
        if (!c.total) throw new BadRequestException('La campaña no tiene destinatarios');
        this.phoneId; // valida env
        if (!process.env.WA_TOKEN) throw new BadRequestException('Falta WA_TOKEN en el .env');

        await this.dataSource.query(
            `UPDATE com_campania SET estado='EN_CURSO', fecha_inicio=COALESCE(fecha_inicio, now()) WHERE id=$1`,
            [id],
        );
        void this.correr(id);
        return this.detalle(id);
    }

    async pausar(id: number) {
        await this.cambiarEstado(id, 'PAUSADA', ['EN_CURSO']);
        return this.detalle(id);
    }

    async cancelar(id: number) {
        await this.cambiarEstado(id, 'CANCELADA', ['BORRADOR', 'PROGRAMADA', 'EN_CURSO', 'PAUSADA']);
        await this.dataSource.query(
            `UPDATE com_campania_destinatario SET estado='EXCLUIDO', error='Campaña cancelada'
              WHERE id_campania=$1 AND estado='PENDIENTE'`,
            [id],
        );
        return this.detalle(id);
    }

    private async cambiarEstado(id: number, nuevo: string, permitidos: string[]) {
        const rows = await this.dataSource.query(`SELECT estado FROM com_campania WHERE id=$1`, [id]);
        if (!rows[0]) throw new NotFoundException('Campaña no encontrada');
        if (!permitidos.includes(rows[0].estado)) {
            throw new BadRequestException(`No se puede pasar de ${rows[0].estado} a ${nuevo}`);
        }
        await this.dataSource.query(`UPDATE com_campania SET estado=$2 WHERE id=$1`, [id, nuevo]);
    }

    // ───────────────────────── worker ─────────────────────────

    private enVentana(): boolean {
        const hora = Number(
            new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', hour: '2-digit', hour12: false })
                .format(new Date()),
        ) % 24;
        return hora >= this.horaIni && hora < this.horaFin;
    }

    private async correr(id: number) {
        if (this.corriendo.has(id)) return;
        this.corriendo.add(id);
        this.logger.log(`Campaña ${id}: envío iniciado (${this.mps} msg/s)`);
        try {
            while (true) {
                const rows = await this.dataSource.query(`SELECT * FROM com_campania WHERE id=$1`, [id]);
                const c = rows[0];
                if (!c || c.estado !== 'EN_CURSO') break;

                if (!this.enVentana()) { await sleep(60_000); continue; } // fuera de horario: espera

                const lote = await this.reclamarLote(id, this.mps);
                if (!lote.length) {
                    await this.cerrarSiTermino(id);
                    break;
                }
                const t0 = Date.now();
                await Promise.all(lote.map((d) => this.enviarUno(c, d)));
                const minimo = (lote.length / this.mps) * 1000;
                const dt = Date.now() - t0;
                if (dt < minimo) await sleep(minimo - dt);
            }
        } catch (e: any) {
            this.logger.error(`Campaña ${id}: error en el worker: ${e.message}`, e.stack);
        } finally {
            this.corriendo.delete(id);
            this.logger.log(`Campaña ${id}: worker detenido`);
        }
    }

    private async reclamarLote(id: number, n: number): Promise<any[]> {
        const res = await this.dataSource.query(
            `UPDATE com_campania_destinatario d
                SET estado='ENVIANDO'
              WHERE d.id IN (
                    SELECT id FROM com_campania_destinatario
                     WHERE id_campania=$1 AND estado='PENDIENTE'
                  ORDER BY id LIMIT $2
                       FOR UPDATE SKIP LOCKED)
          RETURNING d.id, d.telefono, d.nombre, d.datos`,
            [id, n],
        );
        // TypeORM + Postgres: un UPDATE...RETURNING devuelve [filas, cantidad]
        return Array.isArray(res[0]) ? res[0] : res;
    }

    private async cerrarSiTermino(id: number) {
        const r = await this.dataSource.query(
            `SELECT COUNT(*)::int AS n FROM com_campania_destinatario
              WHERE id_campania=$1 AND estado IN ('PENDIENTE','ENVIANDO')`,
            [id],
        );
        if (r[0].n === 0) {
            await this.dataSource.query(
                `UPDATE com_campania SET estado='COMPLETADA', fecha_fin=now() WHERE id=$1 AND estado='EN_CURSO'`,
                [id],
            );
            this.logger.log(`Campaña ${id}: completada`);
        }
    }

    private async enviarUno(c: any, d: any) {
        try {
            const params = (c.parametros as string[]).map((p) => this.resolver(p, d));
            const components: any[] = [];
            if (c.header_tipo && c.header_url) {
                components.push({
                    type: 'header',
                    parameters: [{ type: c.header_tipo, [c.header_tipo]: { link: c.header_url } }],
                });
            }
            if (params.length) {
                components.push({ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) });
            }

            const { data } = await axios.post(
                `${this.graphUrl}/${this.phoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: d.telefono,
                    type: 'template',
                    template: { name: c.plantilla, language: { code: c.idioma }, components },
                },
                { headers: this.headers, timeout: 20000 },
            );
            const wamid = data?.messages?.[0]?.id ?? null;
            await this.dataSource.query(
                `UPDATE com_campania_destinatario
                    SET estado='ENVIADO', wa_message_id=$2, fecha_envio=now(), fecha_estado=now(), error=NULL
                  WHERE id=$1`,
                [d.id, wamid],
            );
        } catch (e: any) {
            const err = e?.response?.data?.error;
            const msg = err ? `${err.code}: ${err.error_data?.details ?? err.message}` : e?.message;
            await this.dataSource.query(
                `UPDATE com_campania_destinatario
                    SET estado='FALLIDO', error=$2, fecha_estado=now() WHERE id=$1`,
                [d.id, String(msg).slice(0, 500)],
            );
            // Errores que afectan a TODA la campaña: se pausa para no quemar el número
            if (err && [190, 131042, 132001, 132012, 130429, 131048].includes(Number(err.code))) {
                this.logger.error(`Campaña ${c.id} pausada por error global de Meta: ${msg}`);
                await this.dataSource.query(
                    `UPDATE com_campania SET estado='PAUSADA' WHERE id=$1 AND estado='EN_CURSO'`,
                    [c.id],
                );
            }
        }
    }

    /** Reemplaza {nombre}, {primer_nombre} y {cualquier_campo_de_datos}; Meta no acepta saltos de línea ni vacíos */
    private resolver(plantilla: string, d: any): string {
        const nombre = String(d.nombre ?? '').trim();
        const campos: Record<string, string> = {
            ...(d.datos ?? {}),
            nombre,
            primer_nombre: nombre.split(/\s+/)[0] || '',
        };
        let out = String(plantilla).replace(/\{(\w+)\}/g, (_m, k) => {
            const v = campos[k];
            if (v) return String(v);
            return k === 'primer_nombre' || k === 'nombre' ? 'cliente' : '';
        });
        out = out.replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
        return out || '-';
    }

    private normalizarTelefono(t?: string): string {
        const d = String(t ?? '').replace(/\D/g, '');
        if (/^9\d{8}$/.test(d)) return `51${d}`;
        if (/^519\d{8}$/.test(d)) return d;
        return ''; // campañas: solo celulares peruanos válidos
    }

    // ───────────────────────── lista de exclusión ─────────────────────────

    async agregarOptout(telefono: string, motivo = 'Manual') {
        const tel = this.normalizarTelefono(telefono);
        if (!tel) throw new BadRequestException('Teléfono inválido');
        await this.dataSource.query(
            `INSERT INTO wa_optout (telefono, motivo) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [tel, motivo],
        );
        await this.excluirPendientes(tel);
        return { telefono: tel, excluido: true };
    }

    async quitarOptout(telefono: string) {
        const tel = this.normalizarTelefono(telefono);
        if (!tel) throw new BadRequestException('Teléfono inválido');
        await this.dataSource.query(`DELETE FROM wa_optout WHERE telefono=$1`, [tel]);
        return { telefono: tel, excluido: false };
    }

    /** Todos los números excluidos (manuales y por respuesta del cliente) */
    async listarOptout() {
        const rows = await this.dataSource.query(`SELECT * FROM wa_optout`);
        const columnasFecha = ['fecha_creacion', 'fecha', 'created_at', 'creado_en', 'fecha_registro'];
        return rows
            .map((r: any) => {
                const f = columnasFecha.map((k) => r[k]).find(Boolean);
                return {
                    telefono: String(r.telefono),
                    motivo: r.motivo ?? null,
                    fecha: f ? new Date(f).toISOString() : null,
                };
            })
            .sort((a: any, b: any) =>
                (b.fecha ?? '').localeCompare(a.fecha ?? '') || a.telefono.localeCompare(b.telefono));
    }

    /** Pasa a EXCLUIDO lo que ese teléfono tenga pendiente en cualquier campaña */
    private async excluirPendientes(tel: string) {
        await this.dataSource.query(
            `UPDATE com_campania_destinatario SET estado='EXCLUIDO', error='Pidió no recibir mensajes'
              WHERE telefono=$1 AND estado='PENDIENTE'`,
            [tel],
        );
    }

    // ───────────────────────── webhook (Meta -> campañas) ─────────────────────────

    /** Procesa SOLO los eventos del número de campañas masivas */
    async procesarWebhook(body: any) {
        const masivo = process.env.WA_BOTMASIVA_PHONE_NUMBER_ID;
        if (!masivo) return;

        for (const entry of body?.entry ?? []) {
            for (const change of entry?.changes ?? []) {
                const value = change?.value;
                if (change?.field !== 'messages') continue;
                if (value?.metadata?.phone_number_id !== masivo) continue;

                for (const st of value.statuses ?? []) {
                    try { await this.procesarEstado(st); }
                    catch (e: any) { this.logger.error(`Estado campaña: ${e.message}`); }
                }
                for (const msg of value.messages ?? []) {
                    try { await this.procesarRespuesta(msg); }
                    catch (e: any) { this.logger.error(`Respuesta campaña: ${e.message}`); }
                }
            }
        }
    }

    private async procesarEstado(st: any) {
        const mapa: Record<string, string> = { delivered: 'ENTREGADO', read: 'LEIDO', failed: 'FALLIDO' };
        const estado = mapa[st.status];
        if (!estado || !st.id) return;

        const error = st.errors?.[0]
            ? `${st.errors[0].code}: ${st.errors[0].error_data?.details ?? st.errors[0].title ?? st.errors[0].message ?? ''}`
            : null;

        await this.dataSource.query(
            `UPDATE com_campania_destinatario
                SET estado=$1::text, error=COALESCE($2, error), fecha_estado=now()
              WHERE wa_message_id=$3
                AND ($1::text = 'FALLIDO'
                  OR COALESCE(array_position(ARRAY['ENVIADO','ENTREGADO','LEIDO']::text[], estado::text), 0)
                   < array_position(ARRAY['ENVIADO','ENTREGADO','LEIDO']::text[], $1::text))`,
            [estado, error, st.id],
        );
    }

    private async procesarRespuesta(msg: any) {
        const tel = String(msg?.from ?? '').replace(/\D/g, '');
        if (!tel) return;

        // Meta reintenta (o repite) los webhooks: un mismo mensaje no se procesa dos veces
        if (msg?.id) {
            if (this.mensajesProcesados.has(msg.id)) return;
            this.mensajesProcesados.add(msg.id);
            if (this.mensajesProcesados.size > 2000) {
                this.mensajesProcesados.delete(this.mensajesProcesados.values().next().value as string);
            }
        }

        const texto: string =
            msg.text?.body ?? msg.button?.text ?? msg.interactive?.button_reply?.title ?? '';

        // Último envío de campaña que recibió ese teléfono (null si nunca fue destinatario)
        const envio = await this.ultimoEnvio(tel);

        // 1) Pide no recibir más mensajes → lista de exclusión (tiene prioridad sobre todo)
        if (this.esBaja(texto)) {
            const yaExcluido = await this.dataSource.query(
                `SELECT 1 FROM wa_optout WHERE telefono=$1 LIMIT 1`, [tel],
            );
            await this.dataSource.query(
                `INSERT INTO wa_optout (telefono, motivo) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
                [tel, `Respondió: ${texto.slice(0, 100)}`],
            );
            await this.excluirPendientes(tel);
            if (envio) await this.registrarRespuesta(envio, tel, 'BAJA', texto);
            if (yaExcluido.length) return;

            await this.enviarTexto(tel, CampaniaMasivaService.MSG_BAJA).catch((e) =>
                this.logger.warn(`No se pudo enviar la confirmación de baja a ${tel}: ${e?.response?.data?.error?.message ?? e.message}`));
            return;
        }

        // No fue destinatario de ninguna campaña: no se clasifica
        if (!envio) return;
        await this.marcarRespuesta(envio.id);

        // 2) Confirma que asistirá → se registra y se le agradece
        if (this.esAsistencia(texto)) {
            await this.registrarRespuesta(envio, tel, 'CONFIRMA', texto);
            await this.agradecerAsistencia(tel);
            return;
        }

        // 3) Pide información / muestra interés
        if (this.esInfo(texto)) {
            await this.registrarRespuesta(envio, tel, 'INFO', texto);
        }
    }

    /** Último envío (campaña + destinatario) recibido por ese teléfono */
    private async ultimoEnvio(tel: string): Promise<{ id: number; id_campania: number } | null> {
        const rows = await this.dataSource.query(
            `SELECT id, id_campania FROM com_campania_destinatario
              WHERE telefono=$1 AND estado IN ('ENVIADO','ENTREGADO','LEIDO')
           ORDER BY fecha_envio DESC NULLS LAST LIMIT 1`,
            [tel],
        );
        return rows[0] ? { id: Number(rows[0].id), id_campania: Number(rows[0].id_campania) } : null;
    }

    private async marcarRespuesta(idDestinatario: number) {
        await this.dataSource.query(
            `UPDATE com_campania_destinatario SET respondio=true, fecha_respuesta=now() WHERE id=$1`,
            [idDestinatario],
        );
    }

    /**
     * Guarda la clasificación: una fila por teléfono, campaña y TIPO.
     * Así, si alguien pide info y luego toca "no interesado", quedan ambas (INFO y BAJA).
     * Si repite el mismo tipo, solo se actualiza el mensaje y la fecha de esa fila.
     * Requiere UNIQUE (id_campania, telefono, tipo).
     */
    private async registrarRespuesta(
        envio: { id: number; id_campania: number },
        tel: string,
        tipo: 'CONFIRMA' | 'INFO' | 'BAJA',
        texto: string,
    ) {
        try {
            await this.dataSource.query(
                `INSERT INTO com_campania_respuesta (id_campania, id_destinatario, telefono, tipo, mensaje)
                 VALUES ($1,$2,$3,$4,$5)
                 ON CONFLICT (id_campania, telefono, tipo) DO UPDATE
                    SET mensaje = EXCLUDED.mensaje,
                        fecha = now()`,
                [envio.id_campania, envio.id, tel, tipo, String(texto ?? '').slice(0, 500)],
            );
        } catch (e: any) {
            this.logger.error(`No se pudo registrar la respuesta (${tipo}) de ${tel}: ${e.message}`);
        }
    }

    /** Envía el agradecimiento una sola vez cada 12 horas por teléfono (evita repetirlo si escribe varias veces) */
    private async agradecerAsistencia(tel: string) {
        const ahora = Date.now();
        const ultimo = this.agradecidos.get(tel);
        if (ultimo && ahora - ultimo < 12 * 60 * 60 * 1000) return;

        this.agradecidos.set(tel, ahora);
        if (this.agradecidos.size > 5000) {
            this.agradecidos.delete(this.agradecidos.keys().next().value as string);
        }
        try {
            await this.enviarTexto(tel, CampaniaMasivaService.MSG_ASISTENCIA);
        } catch (e: any) {
            this.agradecidos.delete(tel); // si falló, que se pueda reintentar
            this.logger.warn(`No se pudo enviar el agradecimiento a ${tel}: ${e?.response?.data?.error?.message ?? e.message}`);
        }
    }

    private async enviarTexto(tel: string, body: string) {
        await axios.post(
            `${this.graphUrl}/${this.phoneId}/messages`,
            { messaging_product: 'whatsapp', to: tel, type: 'text', text: { body } },
            { headers: this.headers, timeout: 15000 },
        );
    }

    // ───────────────────────── mensajes automáticos ─────────────────────────

    private static readonly MSG_BAJA =
        'Gracias por avisarnos. Si más adelante necesitas información, puedes escribirnos al +51 961 872 715. ¡Que tengas un lindo día! 🌟';

    /** Se envía cuando la persona confirma que asistirá (WhatsApp muestra *texto* en negrita) */
    private static readonly MSG_ASISTENCIA =
        '¡Muchas gracias por confirmar su asistencia!\n\n' +
        'Será un gusto contar con tu presencia y recibirte en esta ocasión especial. \n\n' +
        'Si tienes alguna consulta o requieres información adicional, no dudes en comunicarte con nosotros.\n\n' +
        '¡Te esperamos! 🏙️✨\n' +
        '*RyR Inmobiliaria*';

    // ───────────────────────── detección de intención ─────────────────────────

    /**
     * Pasa a minúsculas, quita tildes y reduce letras repetidas 3+ veces
     * ("siiii" → "si", "asistireee" → "asistire"), para que los patrones sean simples.
     */
    private static normalizar(texto: string): string {
        return (texto ?? '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/(.)\1{2,}/g, '$1')
            .trim();
    }

    /**
     * Frases con las que alguien pide no recibir más mensajes o dice que ya no le interesa
     * (se comparan sin tildes ni mayúsculas). Para agregar más, suma otra expresión regular.
     */
    private static readonly PATRONES_BAJA: RegExp[] = [
        // — palabras clave directas —
        /\bbaja\b/,                                         // "baja", "dame de baja", "quiero la baja"
        /\b(stop|basta|unsubscribe|spam)\b/,
        /\bdesuscrib\w*|\bdesuscrip\w*/,
        /cancel\w* (mi |la )?suscripcion/,

        // — ya no le interesa —
        /\bno (me )?interes\w*/,                            // "no me interesa", "no interesa", "no me interesan"
        /\b(ya )?no (estoy|esta|estamos|sigo|seguimos|me encuentro|nos encontramos) (mas |muy |nada |tan )?interesad[oa]s?/, // "ya no estoy interesado/a"
        /\bno (tengo|tenemos|veo|vemos) (mas |ningun |mucho )?interes/, // "no tengo interés"
        /\bsin interes\b/,
        /\bya no (estoy |estamos )?(me )?(quiero|queremos|deseo|deseamos|necesito|necesitamos|busco|buscamos|buscando)/, // "ya no quiero", "ya no estoy buscando"
        /\bno (estoy )?busc\w+ (nada|departamento|depa|casa|terreno|lote|inmueble|propiedad|vivienda)/,
        /\bno,? gracias\b/,                                 // "no gracias", "no, gracias"
        /\bgracias,? pero no\b/,                            // "gracias pero no"

        // — pide que no le escriban —
        /\bno (quiero|deseo|necesito|requiero) (recibir )?(mas )?(mensajes|publicidad|promociones|informacion|ofertas|notificaciones|propaganda)/,
        /\bno (me )?(escriban?|escribas|envien?|envies|manden?|mandes|contacten?|contactes|molesten?|molestes|llamen?|llames)\b/,
        /\bno (me )?sig\w* (escribiendo|enviando|mandando|molestando|llamando|contactando)/, // "no me sigan escribiendo"
        /\b(dejen?|deja|dejar|pare|paren|parar) de (escribir|enviar|mandar|molestar|contactar|llamar|recibir)/,
        /\b(eliminar|elimina|eliminen|borrar|borra|borren|quitar|quita|quiten|sacar|saca|saquen|retirar|retira|retiren)\w* (me |mi |a mi |de |el |mi )?(numero|contacto|de (la |su |esa |sus )?(lista|base))/,
        /\bnumero equivocado|\bequivocaron de numero|\bno soy (el|la) (que|persona)/,
        /\bno (mas|nunca mas)\b.*(mensajes|publicidad|promociones)/,
    ];

    /**
     * Frases con las que alguien confirma que asistirá (se comparan sin tildes ni mayúsculas).
     * Ejemplos: "sí asistiré", "estaré ahí", "nos vemos ahí", "cuenten conmigo", "confirmo".
     * Para agregar más, suma otra expresión regular a la lista.
     */
    private static readonly PATRONES_ASISTENCIA: RegExp[] = [
        // — "sí voy / sí asistiré" —
        /\bsi,? (voy|vamos|ire|iremos|asisto|asistimos|asistire|asistiremos|estare|estaremos|llegare|llegaremos|puedo|podemos|podre|podremos)\b/,
        /\b(asistire|asistiremos|asistiria|asistiriamos)\b/,
        /\b(ire|iremos|llegare|llegaremos|acudire|acudiremos|participare|participaremos)\b/,
        /\b(voy|vamos) a (asistir|ir|estar|llegar|acudir|participar)\b/,
        /\b(puedo|podemos|podre|podremos) (asistir|ir|llegar|acudir|estar presente)\b/,
        /\b(yo|nosotros|nosotras) (voy|vamos|ire|iremos|asistire|asistiremos)\b/,
        /\b(voy|vamos) (sin falta|con mi \w+|con mis \w+|con mi familia|con gusto|con todo gusto|todos|juntos|en familia|puntual|puntuales|temprano|acompanad[oa]s?)\b/,

        // — "estaré ahí / nos vemos ahí" —
        /\b(ahi|alli|alla) (estare|estaremos|nos vemos|nos veremos|nos encontramos|llegare|llegaremos|ire|iremos|voy|vamos|te veo|los veo|las veo)\b/,
        /\b(estare|estaremos) (ahi|alli|alla|presente|presentes|puntual|puntuales|por ahi|sin falta)\b/,
        /\b(sere|seremos) (parte|puntual|puntuales)\b/,
        /\bnos (vemos|veremos|encontramos)\b/,              // "nos vemos", "nos vemos ahí", "nos veremos pronto"

        // — "cuenten conmigo / confirmo" —
        /\bcuent\w* con(migo| nosotr[oa]s)\b/,              // "cuenta conmigo", "cuenten con nosotros"
        /\bconfirm(o|amos|are|aremos)\b/,                   // "confirmo", "confirmo mi asistencia"
        /\bconfirmad[oa]s?\b/,                              // "confirmado", "asistencia confirmada"
        /\b(acepto|aceptamos) (la )?(invitacion|asistir)\b/,
        /\bme (apunto|anoto|inscribo|registro|apuntare|anotare)\b/,
        /\b(reserv|separ)\w* (mi|un|el|mis|nuestro|nuestros) (cupo|cupos|lugar|lugares|espacio|espacios|asiento|asientos|entrada|entradas)\b/,

        // — "quiero asistir" —
        /\b(quiero|queremos|quisiera|quisieramos|me gustaria|nos gustaria|deseo|deseamos) (asistir|ir|participar|acudir|estar presente)\b/,

        // — afirmaciones enfáticas —
        /\b(claro|por supuesto|desde luego|obvio|sin duda) que si\b/,
        /\bsin falta\b/,
        /\bno (me lo )?pierdo\b/,
        /\bno (me lo )?perdere\b/,
        /\bno faltare(mos)?\b/,
    ];

    /** Si aparece alguna de estas, NO se toma como asistencia aunque coincida un patrón ("no asistiré", "no podré ir") */
    private static readonly NEGACIONES_ASISTENCIA: RegExp[] = [
        /\bno (voy|vamos|ire|iremos|podre|podremos|puedo|podemos|podria|podriamos|asistire|asistiremos|asisto|asistimos|asistiria|estare|estaremos|llegare|llegaremos|creo|pienso|quiero|queremos|quisiera|deseo|sere|seremos|acudire|participare|confirmo|confirmamos)\b/,
        /\bno (me es|es|sera) posible\b/,
        /\b(imposible|lamentablemente|desafortunadamente|que pena|una pena|lo siento|sentimos)\b/,
        /\bpero no\b/,
        /\b(ya no|tampoco|nunca|jamas)\b/,
        /\b(cancel\w*|reprogram\w*|posterg\w*)\b/,
    ];

    private esBaja(texto: string): boolean {
        const t = CampaniaMasivaService.normalizar(texto);
        if (!t || t.split(/\s+/).length > 12) return false; // mensajes largos no se tratan como baja
        return CampaniaMasivaService.PATRONES_BAJA.some((re) => re.test(t));
    }

    private esAsistencia(texto: string): boolean {
        const t = CampaniaMasivaService.normalizar(texto);
        if (!t || t.split(/\s+/).length > 20) return false; // mensajes largos suelen ser consultas
        if (CampaniaMasivaService.NEGACIONES_ASISTENCIA.some((re) => re.test(t))) return false;
        return CampaniaMasivaService.PATRONES_ASISTENCIA.some((re) => re.test(t));
    }

    /**
     * Frases con las que alguien pide información o muestra interés
     * (se comparan sin tildes ni mayúsculas). Para agregar más, suma otra expresión regular.
     */
    private static readonly PATRONES_INFO: RegExp[] = [
        // — preguntas en general —
        /[?¿]/,
        /\b(como funciona|en que consiste|de que trata|que incluye|que incluyen|que es|que son|que tipo|quien|quienes|cual|cuales|hay|tienen|tiene|cuentan|aceptan|aceptas|se puede|pueden|podria|podrian|podrias|es posible|existe|existen|requisitos|requiere|ayuda|consulta|consultas|duda|dudas|pregunta|preguntas)\b/,

        // — información / material —
        /\binfo\w*/,                                           // info, informacion, informes, informar
        /\b(detalle|detalles|brochure|folleto|catalogo|presentacion|video|fotos|imagenes|plano|planos|pdf|lista de precios)\b/,

        // — precio y financiamiento —
        /\b(precio|precios|costo|costos|cuesta|cuestan|valor|valores|tarifa|tarifas|cotizacion|cotizar|cotizame|presupuesto|cuanto)\b/,
        /\b(financiamiento|financiar|financiado|credito|creditos|hipotecario|hipoteca|mivivienda|mi vivienda|techo propio|bono|bbp|prestamo|banco|bancos|cuota|cuotas|inicial|mensualidad|separacion|arras|tasa|tea|contado|descuento|descuentos|promocion|promociones|oferta|ofertas)\b/,

        // — ubicación y horarios —
        /\b(ubicacion|ubicado|ubicada|ubicados|direccion|donde|como llego|como llegar|mapa|referencia|distrito|zona|cerca)\b/,
        /\b(horario|horarios|hora|horas|cuando|fecha|dia|dias|a que hora|hasta que hora|que dia)\b/,

        // — el producto —
        /\b(departamento|departamentos|depa|depas|dpto|dptos|casa|casas|lote|lotes|terreno|terrenos|local|locales|oficina|oficinas|inmueble|inmuebles|propiedad|propiedades|vivienda|viviendas|proyecto|proyectos)\b/,
        /\b(dormitorio|dormitorios|habitacion|habitaciones|cuarto|cuartos|metraje|m2|metros|area|areas|piso|pisos|tipologia|tipologias|modelo|modelos|disponible|disponibles|disponibilidad|stock|entrega|entregan|avance|obra|estreno|estrenar|cochera|cocheras|estacionamiento|parking|deposito|balcon|terraza|vista|amenidades|piscina|gimnasio|ascensor|piloto|maqueta|sala de ventas)\b/,

        // — muestra interés —
        /\b(me interesa\w*|nos interesa\w*|interesad[oa]s?)\b/,
        /\b(me gustaria|nos gustaria|quisiera|quisieramos|quiero saber|quiero conocer|quiero ver|quiero mas|necesito mas|necesito|necesitamos|deseo saber|deseo conocer)\b/,

        // — pide que le envíen algo —
        /\b(mandame|mandeme|mandenme|enviame|envieme|envienme|pasame|paseme|pasenme|compartame|compartanme|comparte|compartan|manden|envien|mandar|enviar|pasar|remitame)\b/,

        // — pide contacto, cita o visita —
        /\b(llamame|llameme|llamenme|llamar|llamada|llamen|contactame|contacteme|contactenme|contactar|comuniquense|comunicar|comunicarse|escribeme|escribame|escribanme)\b/,
        /\b(asesor|asesora|ejecutivo|ejecutiva|vendedor|vendedora|agente|cita|visita|visitar|agendar|agenda|reunion|reunirnos|conocer)\b/,

        // — respuestas cortas / saludos (están enganchados con la campaña) —
        /^(hola|buenas|buenos dias|buen dia|buenas tardes|buenas noches|dime|digame|cuentame|cuentenme|mande|adelante|ok|okay|oki|dale|bueno|claro|aja|si|vale|listo)\b/,
    ];

    private esInfo(texto: string): boolean {
        const t = CampaniaMasivaService.normalizar(texto);
        if (!t || t.split(/\s+/).length > 40) return false; // mensajes muy largos: revisión manual
        return CampaniaMasivaService.PATRONES_INFO.some((re) => re.test(t));
    }
}