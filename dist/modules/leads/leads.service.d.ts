import { LeadRepository } from './repository/lead.repository';
import { ICrearLead, IListarClientesPotenciales } from './interface/leads.interface';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class LeadService {
    private leadRepository;
    private readonly supabase;
    constructor(leadRepository: LeadRepository, supabase: SupabaseClient);
    private subirEvidenciaBase64;
    listarleadsdiarios(id_trabajador: number): Promise<import("./interface/leads.interface").ILeadDiario[] | undefined>;
    crearLead(data: ICrearLead): Promise<import("./interface/leads.interface").ILeadCreado>;
    listarClientesPotenciales(data: IListarClientesPotenciales): Promise<import("./interface/leads.interface").IClientePotencial[]>;
    obtenerDetalleLead(id_lead: number): Promise<any>;
    obtenerEtapaActualLead(id_lead: number): Promise<any>;
    finalizarEtapaLeadAsignacion(id_lead_etapa: number): Promise<any>;
    obtenerEstadoContactoLead(id_lead: number): Promise<any>;
    registrarPrimerContacto(id_estado_contacto: number): Promise<any>;
    obtenerInfoEstadoReunionLead(id_lead: number): Promise<any>;
    obtenerHistorialCorreo(id_estado_contacto: number, tipo_historial: number): Promise<any>;
    obtenerHistorialWhatsapp(id_estado_contacto: number, tipo_historial: number): Promise<any>;
    obtenerHistorialLlamadas(id_etapa_lead: number, tipo_historial: number): Promise<any>;
    registrarWhatsapp(data: {
        id_estado_contacto: number;
        url_evidencia: string;
        mensaje?: string;
        tipo_historial: number;
    }): Promise<any>;
    registrarCorreo(data: {
        id_estado_contacto: number;
        url_evidencia: string;
        mensaje?: string;
        tipo_historial: number;
    }): Promise<any>;
    registrarLlamada(data: {
        id_estado_contacto: number;
        fecha_inicio: string;
        fecha_fin?: string;
        duracion_segundos?: number;
        contestada?: boolean;
        grabacion_url?: string;
        observacion?: string;
    }): Promise<any>;
    finalizarEtapaContactoDesistio(data: {
        id_lead: number;
        motivo?: number;
    }): Promise<any>;
    obtenerInfoDesistioLead(idLead: number): Promise<any>;
    agendarReunion(data: {
        idAsesor: number;
        idLead: number;
        idTipoActividad: number;
        titulo: string;
        descripcion: string;
        fecha: string;
        hora: string;
        idUsuarioCreacion: number;
        lugar_plataforma: string;
    }): Promise<any>;
    listarActividadesAsesores(data: {
        fechaInicio?: string | null;
        fechaFin?: string | null;
        idAsesor?: number | null;
        idTipoActividad?: number | null;
        estado?: number | null;
    }): Promise<any>;
    obtenerActividadLead(idLead: number): Promise<any>;
    actualizarFechaHoraActividad(idActividad: number, fecha: string, hora: string): Promise<any>;
    finalizarEtapaContactoAgendarReunion(data: {
        id_lead: number;
    }): Promise<any>;
    obtenerInfoAgendarReuLead(idLead: number): Promise<any>;
    registrarWhatsappreunion(data: {
        id_estado_reunion: number;
        fecha: string;
        hora: string;
        tipo_historial: number;
    }): Promise<any>;
    registrarCorreoreunion(data: {
        id_estado_reunion: number;
        url_evidencia: string;
        mensaje?: string;
        tipo_historial: number;
    }): Promise<any>;
    obtenerHistorialCorreoReunion(id_estado_reunion: number, tipo_historial: number): Promise<any>;
    obtenerHistorialWhatsappReunion(id_estado_reunion: number, tipo_historial: number): Promise<any>;
    obtenerTodasActividades(id_lead: number): Promise<any>;
    finalizarEtapaAtencion(id_lead: number): Promise<any>;
    finalizarEtapaOportunidadDesistio(id_lead: number, motivo?: number): Promise<any>;
}
