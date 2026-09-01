"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let LeadRepository = class LeadRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async gen_listar_lead_diarios(id_trabajador) {
        const result = await this.dataSource.query(`SELECT * FROM com_listar_leads_diarios_v7($1)`, [id_trabajador]);
        return result;
    }
    async crear_lead(data) {
        const result = await this.dataSource.query(`
    SELECT * 
    FROM fn_crear_lead(
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    `, [
            data.id_asesor,
            data.id_proyecto,
            data.nombre_cliente,
            data.dni_cliente,
            data.telefono_cliente,
            data.id_fuente,
            data.usuario_creacion
        ]);
        return result[0];
    }
    async validarLeadDuplicado(dni, telefono) {
        const result = await this.dataSource.query(`
      SELECT *
      FROM fn_validar_lead_duplicado(
        $1,
        $2
      )
    `, [
            dni,
            telefono
        ]);
        return result[0];
    }
    async editarMensajeLeadEtapaContacto(id, mensaje) {
        const result = await this.dataSource.query(`
    SELECT *
    FROM fn_editar_mensaje_lead_etapa_contacto(
      $1,
      $2
    )
    `, [
            id,
            mensaje
        ]);
        return result[0];
    }
    async listar_clientes_potenciales(data) {
        const result = await this.dataSource.query(`
      SELECT *
      FROM com_listar_clientes_potenciales(
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      `, [
            data.busqueda ?? null,
            data.fecha_inicio ?? null,
            data.fecha_fin ?? null,
            data.id_asesor ?? null,
            data.id_fuente ?? null,
            data.id_proyecto ?? null,
        ]);
        return result;
    }
    async obtenerEtapaActualLead(id_lead) {
        const result = await this.dataSource.query(`
      SELECT *
      FROM fn_obtener_etapa_actual_lead($1)
    `, [id_lead]);
        return result;
    }
    async obtenerDetalleLead(id_lead) {
        const result = await this.dataSource.query(`
      SELECT *
      FROM fn_obtener_detalle_lead_cliente($1)
    `, [id_lead]);
        return result[0];
    }
    async finalizarEtapaLeadAsignacion(id_lead_etapa) {
        const result = await this.dataSource.query(`
    SELECT fn_finalizar_etapa_asignacion($1) AS finalizado
    `, [id_lead_etapa]);
        return result[0];
    }
    async obtenerInfoEstadoContactoLead(id_lead) {
        const result = await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_info_estado_contacto_lead($1)
    `, [id_lead]);
        return result[0];
    }
    async obtenerInfoEstadoReunionLead(id_lead) {
        const result = await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_info_reunion($1)
    `, [id_lead]);
        return result[0];
    }
    async obtenerHistorialCorreo(id_estado_contacto, tipo_historial) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_historial_contacto_correo($1, $2)
    `, [id_estado_contacto, tipo_historial]);
    }
    async obtenerHistorialWhatsapp(id_estado_contacto, tipo_historial) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_historial_contacto_whatsapp($1, $2)
    `, [id_estado_contacto, tipo_historial]);
    }
    async obtenerHistorialLlamadas(id_etapa_lead, tipo_historial) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_historial_contacto_llamadas($1, $2)
    `, [id_etapa_lead, tipo_historial]);
    }
    async registrarWhatsapp(data) {
        const result = await this.dataSource.query(`
      SELECT fn_guardar_whatsapp_evidencia(
        $1,
        $2,
        $3,
        $4
      ) AS id
    `, [
            data.id_estado_contacto,
            data.url_evidencia,
            data.mensaje ?? null,
            data.tipo_historial,
        ]);
        return result[0];
    }
    async registrarCorreo(data) {
        const result = await this.dataSource.query(`
      SELECT fn_guardar_correo_evidencia(
        $1,
        $2,
        $3,
        $4
      ) AS id
    `, [
            data.id_estado_contacto,
            data.url_evidencia,
            data.mensaje ?? null,
            data.tipo_historial,
        ]);
        return result[0];
    }
    async registrarLlamada(data) {
        const result = await this.dataSource.query(`
 SELECT fn_guardar_llamada_evidencia(
    $1,
    $2,
    $3,
    $4,
    $5
 ) AS id
 `, [
            data.id_estado_contacto,
            data.fecha_inicio,
            data.fecha_fin ?? null,
            data.contestada ?? false,
            data.grabacion_url ?? null
        ]);
        return result[0];
    }
    async finalizarEtapaContactoDesistio(data) {
        const result = await this.dataSource.query(`
      SELECT fn_finalizar_etapa_contacto_desistio(
        $1,
        $2
      ) AS estado
    `, [
            data.id_lead,
            data.motivo ?? null
        ]);
        return result[0];
    }
    async obtenerInfoDesistioLead(idLead) {
        const result = await this.dataSource.query(`
      SELECT *
      FROM fn_obtener_info_desistio_lead($1)
    `, [
            idLead
        ]);
        return result[0] ?? null;
    }
    async agendarReunion(data) {
        const result = await this.dataSource.query(`
    SELECT *
    FROM fn_agendar_reunion(
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9
    )
    `, [
            data.idAsesor,
            data.idLead,
            data.idTipoActividad,
            data.titulo,
            data.descripcion,
            data.fecha,
            data.hora,
            data.idUsuarioCreacion,
            data.lugar_plataforma
        ]);
        return result[0] ?? null;
    }
    async listarActividadesAsesores(data) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_listar_actividades_asesores(
      $1,
      $2,
      $3,
      $4,
      $5
    )
    `, [
            data.fechaInicio ?? null,
            data.fechaFin ?? null,
            data.idAsesor ?? null,
            data.idTipoActividad ?? null,
            data.estado ?? null,
        ]);
    }
    async obtenerActividadLead(idLead) {
        return await this.dataSource.query(`
      SELECT *
      FROM fn_obtener_actividad_lead($1)
    `, [idLead]);
    }
    async actualizarFechaHoraActividad(idActividad, fecha, hora) {
        return await this.dataSource.query(`
      SELECT fn_reprogramar_actividad($1, $2, $3)
    `, [idActividad, fecha, hora]);
    }
    async finalizarEtapaContactoAgendarReunion(data) {
        const result = await this.dataSource.query(`
    SELECT fn_finalizar_etapa_contacto_agendarreunion(
      $1
    ) AS estado
    `, [
            data.id_lead
        ]);
        return result[0];
    }
    async obtenerInfoAgendarReuLead(idLead) {
        const result = await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_info_agendarreu_lead($1)
    `, [idLead]);
        return result;
    }
    async registrarWhatsappreunion(data) {
        const result = await this.dataSource.query(`
    SELECT fn_guardar_whatsapp_evidencia_reunion(
      $1,
      $2,
      $3,
      $4
    ) AS id
  `, [
            data.id_estado_reunion,
            data.fecha,
            data.hora,
            data.tipo_historial,
        ]);
        return result[0];
    }
    async registrarCorreoreunion(data) {
        const result = await this.dataSource.query(`
      SELECT fn_guardar_correo_evidencia_reunion(
        $1,
        $2,
        $3,
        $4
      ) AS id
    `, [
            data.id_estado_reunion,
            data.url_evidencia,
            data.mensaje ?? null,
            data.tipo_historial,
        ]);
        return result[0];
    }
    async obtenerHistorialCorreoReunion(id_estado_reunion, tipo_historial) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_historial_contacto_correo_reunion($1, $2)
    `, [id_estado_reunion, tipo_historial]);
    }
    async obtenerHistorialWhatsappReunion(id_estado_reunion, tipo_historial) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_historial_contacto_whatsapp_reunion($1, $2)
    `, [id_estado_reunion, tipo_historial]);
    }
    async obtenerTodasActividades(id_lead) {
        return await this.dataSource.query(`
    SELECT *
    FROM fn_obtener_todas_actividades($1)
    `, [id_lead]);
    }
    async finalizarEtapaAtencion(id_lead) {
        return await this.dataSource.query(`
    SELECT fn_finalizar_etapa_atencion($1) AS resultado
    `, [id_lead]);
    }
    async finalizarEtapaOportunidadDesistio(id_lead, motivo) {
        return await this.dataSource.query(`
    SELECT fn_finalizar_etapa_oportunidad_desistio($1, $2) AS resultado
    `, [id_lead, motivo ?? null]);
    }
    async finalizarEtapaNegociacionDesistio(id_lead, motivo) {
        return await this.dataSource.query(`
    SELECT fn_finalizar_etapa_negociacion_desistio($1, $2) AS resultado
    `, [id_lead, motivo ?? null]);
    }
    async finalizarEtapaCierreDesistio(id_lead, motivo) {
        return await this.dataSource.query(`
    SELECT fn_finalizar_etapa_cierre_desistio($1, $2) AS resultado
    `, [id_lead, motivo ?? null]);
    }
    async finalizarEtapaNegociacion(id_lead) {
        return await this.dataSource.query(`
      SELECT fn_finalizar_etapa_negociacion($1) AS resultado
    `, [id_lead]);
    }
    async finalizarEtapaCierre(id_lead) {
        return await this.dataSource.query(`
      SELECT fn_finalizar_etapa_cierre($1) AS resultado
    `, [id_lead]);
    }
    async finalizarActividad(id_actividad) {
        return await this.dataSource.query(`
      SELECT fn_finalizar_actividad($1) AS resultado
    `, [id_actividad]);
    }
    async registrarPrimerContacto(id_estado_contacto) {
        const result = await this.dataSource.query(`
      SELECT fn_registrar_primer_contacto($1);
    `, [id_estado_contacto]);
        return result[0];
    }
    async actualizarChecklistNegociacion(id_lead_etapa, campo, valor) {
        return await this.dataSource.query(`
      SELECT *
      FROM public.fn_actualizar_checklist_negociacion($1, $2, $3)
    `, [
            id_lead_etapa,
            campo,
            valor,
        ]);
    }
    async obtenerChecklistNegociacion(id_lead) {
        return await this.dataSource.query(`
      SELECT *
      FROM public.fn_obtener_checklist_negociacion($1)
    `, [id_lead]);
    }
    async actualizarChecklistCierre(id_lead_etapa, campo, valor) {
        return await this.dataSource.query(`
      SELECT *
      FROM public.fn_actualizar_checklist_cierre($1, $2, $3)
    `, [
            id_lead_etapa,
            campo,
            valor,
        ]);
    }
    async obtenerChecklistCierre(id_lead) {
        return await this.dataSource.query(`
      SELECT *
      FROM public.fn_obtener_checklist_cierre($1)
    `, [id_lead]);
    }
};
exports.LeadRepository = LeadRepository;
exports.LeadRepository = LeadRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], LeadRepository);
//# sourceMappingURL=lead.repository.js.map