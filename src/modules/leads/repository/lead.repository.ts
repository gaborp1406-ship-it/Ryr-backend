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
  async crear_lead(data: ICrearLead) {

    const result: ILeadCreado[] = await this.dataSource.query(
      `
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
    `,
      [
        data.id_asesor,
        data.id_proyecto,
        data.nombre_cliente,
        data.dni_cliente,
        data.telefono_cliente,
        data.id_fuente,
        data.usuario_creacion
      ]
    );


    return result[0];
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

    return result[0];
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

  async obtenerHistorialCorreo(id_estado_contacto: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_correo($1)
    `,
      [id_estado_contacto],
    );
  }

  async obtenerHistorialWhatsapp(id_estado_contacto: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_whatsapp($1)
    `,
      [id_estado_contacto],
    );
  }

  async obtenerHistorialLlamadas(id_estado_contacto: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM fn_obtener_historial_contacto_llamadas($1)
    `,
      [id_estado_contacto],
    );
  }


  async registrarWhatsapp(data: {
    id_estado_contacto: number;
    url_evidencia: string;
    mensaje?: string;
  }) {


    const result = await this.dataSource.query(
      `
 SELECT fn_guardar_whatsapp_evidencia(
    $1,
    $2,
    $3
 ) AS id
 `,
      [
        data.id_estado_contacto,
        data.url_evidencia,
        data.mensaje ?? null
      ]
    );


    return result[0];

  }

  async registrarCorreo(data: {
    id_estado_contacto: number;
    url_evidencia: string;
    mensaje?: string;
  }) {


    const result = await this.dataSource.query(
      `
 SELECT fn_guardar_correo_evidencia(
    $1,
    $2,
    $3
 ) AS id
 `,
      [
        data.id_estado_contacto,
        data.url_evidencia,
        data.mensaje ?? null
      ]
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


    return result[0] ?? null;

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
      $8
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
        data.idUsuarioCreacion
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
}
