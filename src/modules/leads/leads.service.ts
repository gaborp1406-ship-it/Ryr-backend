import { Inject, Injectable } from '@nestjs/common';
import { LeadRepository } from './repository/lead.repository';
import { ICrearLead, IListarClientesPotenciales } from './interface/leads.interface';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class LeadService {
  constructor(private leadRepository: LeadRepository,

    @Inject("SUPABASE_CLIENT")
    private readonly supabase: SupabaseClient,
  ) { }


  private async subirEvidenciaBase64(base64: string): Promise<string> {

    try {

      // Separar metadata del base64
      const matches = base64.match(/^data:(.+);base64,(.+)$/);

      let contentType = "image/png";
      let dataBase64 = base64;

      if (matches) {
        contentType = matches[1];
        dataBase64 = matches[2];
      }

      // convertir base64 a buffer
      const buffer = Buffer.from(dataBase64, "base64");


      // extensión
      const extension = contentType.split("/")[1] || "png";


      // nombre único
      const fileName = `evidencias/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${extension}`;


      const { error } = await this.supabase.storage
        .from("leadsevidencia")
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        });


      if (error) {
        throw error;
      }


      const { data } = this.supabase.storage
        .from("leadsevidencia")
        .getPublicUrl(fileName);


      return data.publicUrl;


    } catch (error) {

      console.log("Error subiendo evidencia:", error);
      throw error;

    }

  }
  async listarleadsdiarios(id_trabajador: number) {
    try {
      const result =
        await this.leadRepository.gen_listar_lead_diarios(id_trabajador);

      if (!result) {
        throw new Error('Error inesperado al listar leads');
      }

      return result;
    } catch (error) {
      console.log('Error al listar leads:', error);
    }
  }
  async crearLead(data: ICrearLead) {

    try {

      const result =
        await this.leadRepository.crear_lead(data);


      if (!result) {
        throw new Error(
          'No se pudo crear el lead'
        );
      }


      return result;


    } catch (error) {

      console.log(
        'Error al crear lead:',
        error
      );

      throw error;
    }
  }
  async listarClientesPotenciales(data: IListarClientesPotenciales) {

    try {

      return await this.leadRepository.listar_clientes_potenciales(data);

    } catch (error) {

      console.log(error);
      throw error;

    }

  }

  async obtenerDetalleLead(id_lead: number) {
    try {
      const result =
        await this.leadRepository.obtenerDetalleLead(id_lead);

      if (!result) {
        throw new Error('No se encontró el lead.');
      }

      return result;
    } catch (error) {
      console.log('Error al obtener el detalle del lead:', error);
      throw error;
    }
  }
  async obtenerEtapaActualLead(id_lead: number) {
    try {
      const result =
        await this.leadRepository.obtenerEtapaActualLead(id_lead);

      if (!result || result.length === 0) {
        throw new Error('No se encontraron etapas para el lead.');
      }

      return result;
    } catch (error) {
      console.log('Error al obtener las etapas del lead:', error);
      throw error;
    }
  }
  async finalizarEtapaLeadAsignacion(id_lead_etapa: number) {
    try {
      const result =
        await this.leadRepository.finalizarEtapaLeadAsignacion(id_lead_etapa);

      if (!result?.finalizado) {
        throw new Error('No se pudo finalizar la etapa.');
      }

      return result;
    } catch (error) {
      console.log('Error al finalizar la etapa del lead:', error);
      throw error;
    }
  }


  async obtenerEstadoContactoLead(id_lead: number) {
    try {
      return await this.leadRepository.obtenerInfoEstadoContactoLead(id_lead);
    } catch (error) {
      console.log('Error al obtener el estado de contacto:', error);
      throw error;
    }
  }

  async obtenerInfoEstadoReunionLead(id_lead: number) {
    try {
      return await this.leadRepository.obtenerInfoEstadoReunionLead(id_lead);
    } catch (error) {
      console.log('Error al obtener el estado de contacto:', error);
      throw error;
    }
  }

  async obtenerHistorialCorreo(
    id_estado_contacto: number,
    tipo_historial: number,
  ) {
    return await this.leadRepository.obtenerHistorialCorreo(
      id_estado_contacto,
      tipo_historial,
    );
  }

  async obtenerHistorialWhatsapp(
    id_estado_contacto: number,
    tipo_historial: number,
  ) {
    return await this.leadRepository.obtenerHistorialWhatsapp(
      id_estado_contacto,
      tipo_historial,
    );
  }

  async obtenerHistorialLlamadas(
    id_estado_contacto: number,
    tipo_historial: number,
  ) {
    return await this.leadRepository.obtenerHistorialLlamadas(
      id_estado_contacto,
      tipo_historial,
    );
  }

  async registrarWhatsapp(data: {
    id_estado_contacto: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    try {
      let url = data.url_evidencia;

      if (url && url.startsWith('data:')) {
        url = await this.subirEvidenciaBase64(url);
      }

      return await this.leadRepository.registrarWhatsapp({
        ...data,
        url_evidencia: url,
      });
    } catch (error) {
      console.log('Error al registrar whatsapp:', error);
      throw error;
    }
  }

  async registrarCorreo(data: {
    id_estado_contacto: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    try {
      let url = data.url_evidencia;

      if (url && url.startsWith('data:')) {
        url = await this.subirEvidenciaBase64(url);
      }

      return await this.leadRepository.registrarCorreo({
        ...data,
        url_evidencia: url,
      });
    } catch (error) {
      console.log('Error al registrar correo:', error);
      throw error;
    }
  }

  async registrarLlamada(data: {
    id_estado_contacto: number;
    fecha_inicio: string;
    fecha_fin?: string;
    duracion_segundos?: number;
    contestada?: boolean;
    grabacion_url?: string;
    observacion?: string;
  }) {

    try {

      return await this.leadRepository.registrarLlamada(data);

    } catch (error) {

      console.log(
        'Error al registrar llamada:',
        error
      );

      throw error;
    }

  }

  async finalizarEtapaContactoDesistio(data: {
    id_lead: number;
    motivo?: number;
  }) {

    try {

      return await this.leadRepository.finalizarEtapaContactoDesistio(data);

    } catch (error) {

      console.log(
        'Error al finalizar etapa contacto desistio:',
        error
      );

      throw error;
    }

  }

  async obtenerInfoDesistioLead(
    idLead: number
  ) {

    try {

      return await this.leadRepository.obtenerInfoDesistioLead(
        idLead
      );

    } catch (error) {

      console.log(
        'Error al obtener info desistio lead:',
        error
      );

      throw error;
    }

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

    try {

      return await this.leadRepository.agendarReunion(
        data
      );

    } catch (error) {

      console.log(
        'Error al agendar reunion:',
        error
      );

      throw error;
    }

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

    try {

      return await this.leadRepository.listarActividadesAsesores(
        data
      );

    } catch (error) {

      console.log(
        'Error al listar actividades de asesores:',
        error
      );

      throw error;

    }

  }
  async obtenerActividadLead(idLead: number) {
    try {
      return await this.leadRepository.obtenerActividadLead(idLead);
    } catch (error) {
      console.log(
        'Error al obtener actividades del lead:',
        error,
      );

      throw error;
    }
  }


  async actualizarFechaHoraActividad(
    idActividad: number,
    fecha: string,
    hora: string,
  ) {
    try {
      return await this.leadRepository.actualizarFechaHoraActividad(
        idActividad,
        fecha,
        hora,
      );
    } catch (error) {
      console.log(
        'Error al actualizar fecha y hora de la actividad:',
        error,
      );

      throw error;
    }
  }
  async finalizarEtapaContactoAgendarReunion(data: {
    id_lead: number;
  }) {

    try {

      return await this.leadRepository.finalizarEtapaContactoAgendarReunion(data);

    } catch (error) {

      console.log(
        'Error al finalizar etapa contacto agendar reunión:',
        error
      );

      throw error;
    }

  }

  async obtenerInfoAgendarReuLead(idLead: number) {

    try {

      return await this.leadRepository.obtenerInfoAgendarReuLead(idLead);

    } catch (error) {

      console.log(
        'Error al obtener información de agendar reunión:',
        error
      );

      throw error;
    }

  }





  async registrarWhatsappreunion(data: {
    id_estado_reunion: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    try {
      let url = data.url_evidencia;

      if (url && url.startsWith('data:')) {
        url = await this.subirEvidenciaBase64(url);
      }

      return await this.leadRepository.registrarWhatsappreunion({
        ...data,
        url_evidencia: url,
      });
    } catch (error) {
      console.log('Error al registrar whatsapp:', error);
      throw error;
    }
  }

  async registrarCorreoreunion(data: {
    id_estado_reunion: number;
    url_evidencia: string;
    mensaje?: string;
    tipo_historial: number;
  }) {
    try {
      let url = data.url_evidencia;

      if (url && url.startsWith('data:')) {
        url = await this.subirEvidenciaBase64(url);
      }

      return await this.leadRepository.registrarCorreoreunion({
        ...data,
        url_evidencia: url,
      });
    } catch (error) {
      console.log('Error al registrar correo:', error);
      throw error;
    }
  }

  async obtenerHistorialCorreoReunion(
    id_estado_reunion: number,
    tipo_historial: number,
  ) {
    return await this.leadRepository.obtenerHistorialCorreoReunion(
      id_estado_reunion,
      tipo_historial,
    );
  }

  async obtenerHistorialWhatsappReunion(
    id_estado_reunion: number,
    tipo_historial: number,
  ) {
    return await this.leadRepository.obtenerHistorialWhatsappReunion(
      id_estado_reunion,
      tipo_historial,
    );
  }

  async obtenerTodasActividades(id_lead: number) {
    return await this.leadRepository.obtenerTodasActividades(id_lead);
  }
  async finalizarEtapaAtencion(id_lead: number) {
    return await this.leadRepository.finalizarEtapaAtencion(id_lead);
  }

  async finalizarEtapaOportunidadDesistio(
    id_lead: number,
    motivo?: number,
  ) {
    return await this.leadRepository.finalizarEtapaOportunidadDesistio(
      id_lead,
      motivo,
    );
  }
}
