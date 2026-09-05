import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IClientePotencial, ICrearLead, ILeadCreado, ILeadDiario, IListarClientesPotenciales } from '../interface/leads.interface';
@Injectable()
export class LeadRepository {
  constructor(private dataSource: DataSource) { }

  async gen_listar_lead_diarios(id_trabajador: number) {
    const result: ILeadDiario[] = await this.dataSource.query(
      `SELECT * FROM com_listar_leads_diarios_v7($1)`,
      [id_trabajador],
    );

    return result;
  }
  async crear_lead(data: ICrearLead): Promise<ILeadCreado> {

    const result: ILeadCreado[] = await this.dataSource.query(
      `
      SELECT *
      FROM fn_crear_lead_v2(
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
    `,
      [
        data.id_asesor,          // trabajador que registra
        data.id_proyecto,
        data.nombre_cliente,
        data.dni_cliente,
        data.telefono_cliente,
        data.id_fuente,
        data.usuario_creacion,
      ],
    );

    if (!result.length) {
      throw new Error('La función fn_crear_lead no devolvió información');
    }

    return result[0];
  }


  async validarLeadDuplicado(
    dni: string,
    telefono: string
  ) {

    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_validar_lead_duplicado(
        $1,
        $2
      )
    `,
      [
        dni,
        telefono
      ]
    );

    return result[0];
  }
  async editarMensajeLeadEtapaContacto(
    id: number,
    mensaje: string
  ) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM fn_editar_mensaje_lead_etapa_contacto(
      $1,
      $2
    )
    `,
      [
        id,
        mensaje
      ]
    );

    return result[0];
  }

  async obtenerLeadsPorEtapaActual(
    idEtapa?: number,
    idAgente?: number
  ) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public.fn_obtener_leads_por_etapa_actual(
      $1,
      $2
    )
    `,
      [
        idEtapa ?? null,
        idAgente ?? null
      ]
    );

    return result;
  }

  async reabrirLeadEtapa(idLeadEtapa: number) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public.fn_reabrir_lead_etapa($1)
    `,
      [idLeadEtapa]
    );

    return result;
  }
  async listar_clientes_potenciales(data: IListarClientesPotenciales) {

    const result: IClientePotencial[] =
      await this.dataSource.query(
        `
      SELECT *
      FROM com_listar_clientes_potenciales(
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      `,
        [
          data.busqueda ?? null,
          data.fecha_inicio ?? null,
          data.fecha_fin ?? null,
          data.id_asesor ?? null,
          data.id_fuente ?? null,
          data.id_proyecto ?? null,
        ],
      );

    return result;
  }

  async obtenerEtapaActualLead(id_lead: number) {
    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_obtener_etapa_actual_lead($1)
    `,
      [id_lead],
    );

    return result;
  }



  async obtenerDetalleLead(id_lead: number) {
    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_obtener_detalle_lead_cliente($1)
    `,
      [id_lead],
    );

    return result[0];
  }

  async finalizarEtapaLeadAsignacion(id_lead_etapa: number) {
    const result = await this.dataSource.query(
      `
    SELECT fn_finalizar_etapa_asignacion($1) AS finalizado
    `,
      [id_lead_etapa],
    );

    return result[0];
  }








  async obtenerInfoEstadoContactoLead(id_lead: number) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_info_estado_contacto_lead($1)
    `,
      [id_lead],
    );

    return result[0];
  }

  async obtenerInfoEstadoReunionLead(id_lead: number) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_info_reunion($1)
    `,
      [id_lead],
    );

    return result[0];
  }
  async obtenerHistorialCorreo(
    id_estado_contacto: number,
    tipo_historial: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_correo($1, $2)
    `,
      [id_estado_contacto, tipo_historial],
    );
  }

  async obtenerHistorialWhatsapp(
    id_estado_contacto: number,
    tipo_historial: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_whatsapp($1, $2)
    `,
      [id_estado_contacto, tipo_historial],
    );
  }

  async obtenerHistorialLlamadas(
    id_etapa_lead: number,
    tipo_historial: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_llamadas($1, $2)
    `,
      [id_etapa_lead, tipo_historial],
    );
  }





  async registrarWhatsapp(data: {
    id_estado_contacto: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    const result = await this.dataSource.query(
      `
      SELECT fn_guardar_whatsapp_evidencia(
        $1,
        $2,
        $3,
        $4
      ) AS id
    `,
      [
        data.id_estado_contacto,
        data.url_evidencia,
        data.mensaje ?? null,
        data.tipo_historial,
      ],
    );

    return result[0];
  }

  async registrarCorreo(data: {
    id_estado_contacto: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    const result = await this.dataSource.query(
      `
      SELECT fn_guardar_correo_evidencia(
        $1,
        $2,
        $3,
        $4
      ) AS id
    `,
      [
        data.id_estado_contacto,
        data.url_evidencia,
        data.mensaje ?? null,
        data.tipo_historial,
      ],
    );

    return result[0];
  }

  async registrarLlamada(data: any) {


    const result = await this.dataSource.query(
      `
 SELECT fn_guardar_llamada_evidencia(
    $1,
    $2,
    $3,
    $4,
    $5
 ) AS id
 `,
      [
        data.id_estado_contacto,
        data.fecha_inicio,
        data.fecha_fin ?? null,
        data.contestada ?? false,
        data.grabacion_url ?? null
      ]
    );


    return result[0];

  }
  async finalizarEtapaContactoDesistio(data: {
    id_lead: number;
    motivo?: number;
  }) {


    const result = await this.dataSource.query(
      `
      SELECT fn_finalizar_etapa_contacto_desistio(
        $1,
        $2
      ) AS estado
    `,
      [
        data.id_lead,
        data.motivo ?? null
      ]
    );


    return result[0];

  }

async obtenerInfoDesistioLead(
  idLead: number
) {

  const result = await this.dataSource.query(
    `
    SELECT *
    FROM fn_obtener_info_desistio_lead($1)
    `,
    [
      idLead
    ]
  );

  return result;

}

async obtenerInfoDesistioLeadOpo(
  idLead: number
) {

  const result = await this.dataSource.query(
    `
    SELECT *
    FROM fn_obtener_info_desistio_oportunidad_lead($1)
    `,
    [
      idLead
    ]
  );

  return result;

}

  


  async agendarReunion(
    data: {
      idAsesor: number;
      idLead: number;
      idTipoActividad: number;
      titulo: string;
      descripcion: string;
      fecha: string;
      hora: string;
      idUsuarioCreacion: number;
      lugar_plataforma: string;
    }
  ) {


    const result = await this.dataSource.query(
      `
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
    `,
      [
        data.idAsesor,
        data.idLead,
        data.idTipoActividad,
        data.titulo,
        data.descripcion,
        data.fecha,
        data.hora,
        data.idUsuarioCreacion,
        data.lugar_plataforma
      ]
    );


    return result[0] ?? null;

  }


  async listarActividadesAsesores(
    data: {
      fechaInicio?: string | null;
      fechaFin?: string | null;
      idAsesor?: number | null;
      idTipoActividad?: number | null;
      estado?: number | null;
    }
  ) {

    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_listar_actividades_asesores(
      $1,
      $2,
      $3,
      $4,
      $5
    )
    `,
      [
        data.fechaInicio ?? null,
        data.fechaFin ?? null,
        data.idAsesor ?? null,
        data.idTipoActividad ?? null,
        data.estado ?? null,
      ]
    );

  }

  async obtenerActividadLead(idLead: number) {
    return await this.dataSource.query(
      `
      SELECT *
      FROM fn_obtener_actividad_lead($1)
    `,
      [idLead],
    );
  }

  async actualizarFechaHoraActividad(
    idActividad: number,
    fecha: string,
    hora: string,
  ) {
    return await this.dataSource.query(
      `
      SELECT fn_reprogramar_actividad($1, $2, $3)
    `,
      [idActividad, fecha, hora],
    );
  }
  async finalizarEtapaContactoAgendarReunion(data: {
    id_lead: number;
  }) {

    const result = await this.dataSource.query(
      `
    SELECT fn_finalizar_etapa_contacto_agendarreunion(
      $1
    ) AS estado
    `,
      [
        data.id_lead
      ]
    );

    return result[0];

  }

  async obtenerInfoAgendarReuLead(idLead: number) {

    const result = await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_info_agendarreu_lead($1)
    `,
      [idLead]
    );

    return result;

  }

  // Repository
  async registrarWhatsappreunion(data: {
    id_estado_reunion: number;
    fecha: string;
    hora: string;
    tipo_historial: number;
  }) {
    const result = await this.dataSource.query(
      `
    SELECT fn_guardar_whatsapp_evidencia_reunion(
      $1,
      $2,
      $3,
      $4
    ) AS id
  `,
      [
        data.id_estado_reunion,
        data.fecha,
        data.hora,
        data.tipo_historial,
      ],
    );

    return result[0];
  }

  async registrarCorreoreunion(data: {
    id_estado_reunion: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    const result = await this.dataSource.query(
      `
      SELECT fn_guardar_correo_evidencia_reunion(
        $1,
        $2,
        $3,
        $4
      ) AS id
    `,
      [
        data.id_estado_reunion,
        data.url_evidencia,
        data.mensaje ?? null,
        data.tipo_historial,
      ],
    );

    return result[0];
  }

  async obtenerHistorialCorreoReunion(
    id_estado_reunion: number,
    tipo_historial: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_correo_reunion($1, $2)
    `,
      [id_estado_reunion, tipo_historial],
    );
  }

  async obtenerHistorialWhatsappReunion(
    id_estado_reunion: number,
    tipo_historial: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_whatsapp_reunion($1, $2)
    `,
      [id_estado_reunion, tipo_historial],
    );
  }

  async obtenerTodasActividades(id_lead: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_todas_actividades($1)
    `,
      [id_lead],
    );
  }
  async finalizarEtapaAtencion(id_lead: number) {
    return await this.dataSource.query(
      `
    SELECT fn_finalizar_etapa_atencion($1) AS resultado
    `,
      [id_lead],
    );
  }

  async finalizarEtapaOportunidadDesistio(
    id_lead: number,
    motivo?: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT fn_finalizar_etapa_oportunidad_desistio($1, $2) AS resultado
    `,
      [id_lead, motivo ?? null],
    );
  }



  async finalizarEtapaNegociacionDesistio(
    id_lead: number,
    motivo?: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT fn_finalizar_etapa_negociacion_desistio($1, $2) AS resultado
    `,
      [id_lead, motivo ?? null],
    );
  }

  async finalizarEtapaCierreDesistio(
    id_lead: number,
    motivo?: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT fn_finalizar_etapa_cierre_desistio($1, $2) AS resultado
    `,
      [id_lead, motivo ?? null],
    );
  }




  async finalizarEtapaNegociacion(id_lead: number) {
    return await this.dataSource.query(
      `
      SELECT fn_finalizar_etapa_negociacion($1) AS resultado
    `,
      [id_lead],
    );
  }


  async finalizarEtapaCierre(id_lead: number) {
    return await this.dataSource.query(
      `
      SELECT fn_finalizar_etapa_cierre($1) AS resultado
    `,
      [id_lead],
    );
  }


  async finalizarActividad(id_actividad: number) {
    return await this.dataSource.query(
      `
      SELECT fn_finalizar_actividad($1) AS resultado
    `,
      [id_actividad],
    );
  }


  async registrarPrimerContacto(id_estado_contacto: number) {
    const result = await this.dataSource.query(
      `
      SELECT fn_registrar_primer_contacto($1);
    `,
      [id_estado_contacto],
    );

    return result[0];
  }
  async actualizarChecklistNegociacion(
    id_lead_etapa: number,
    campo: string,
    valor: boolean,
  ) {
    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_actualizar_checklist_negociacion($1, $2, $3)
    `,
      [
        id_lead_etapa,
        campo,
        valor,
      ],
    );
  }

  async obtenerChecklistNegociacion(
    id_lead: number,
  ) {
    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_obtener_checklist_negociacion($1)
    `,
      [id_lead],
    );
  }




  async actualizarChecklistCierre(
    id_lead_etapa: number,
    campo: string,
    valor: boolean,
  ) {
    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_actualizar_checklist_cierre($1, $2, $3)
    `,
      [
        id_lead_etapa,
        campo,
        valor,
      ],
    );
  }

  async obtenerChecklistCierre(
    id_lead: number,
  ) {
    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_obtener_checklist_cierre($1)
    `,
      [id_lead],
    );
  }

  async registrarDocumentoCierre(data: {
    id_etapa_cierre: number;
    nombre_documento: string;
    url_documento: string;
    tipo_documento?: string;
  }) {

    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_registrar_documento_cierre(
        $1,
        $2,
        $3,
        $4
      )
    `,
      [
        data.id_etapa_cierre,
        data.nombre_documento,
        data.url_documento,
        data.tipo_documento ?? null,
      ],
    );
  }
  async obtenerDocumentosCierre(id_etapa_cierre: number) {

    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_obtener_documentos_cierre($1)
    `,
      [id_etapa_cierre],
    );
  }
  async eliminarDocumentoCierre(
    id: number,
  ) {
    return await this.dataSource.query(
      `
      SELECT *
      FROM public.fn_eliminar_documento_cierre($1)
    `,
      [
        id,
      ],
    );
  }
  async guardarMensajeLeadEtapaContacto(
    id_lead_etapa_contacto: number,
    mensaje: string,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public.fn_guardar_mensaje_lead_etapa_contacto($1, $2)
    `,
      [
        id_lead_etapa_contacto,
        mensaje,
      ],
    );
  }

  async obtenerHistorialMensajesLeadEtapaContacto(
    id_lead_etapa_contacto: number,
  ) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public.fn_obtener_historial_mensajes_lead_etapa_contacto($1)
    `,
      [
        id_lead_etapa_contacto,
      ],
    );
  }

  async listarEtapas() {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public.fn_listar_etapas()
    `
    );

    return result;
  }
}
