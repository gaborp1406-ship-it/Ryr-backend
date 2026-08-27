import { LeadService } from './leads.service';
import type { ICrearLead, IListarClientesPotenciales } from './interface/leads.interface';
export declare class LeadController {
    private readonly leadService;
    constructor(leadService: LeadService);
    listarAsesorDisponible(id_trabajador: number): Promise<import("./interface/leads.interface").ILeadDiario[] | undefined>;
    crearLead(data: ICrearLead): Promise<import("./interface/leads.interface").ILeadCreado>;
    obtenerDetalleLead(id_lead: number): Promise<any>;
    listarClientesPotenciales(data: IListarClientesPotenciales): Promise<import("./interface/leads.interface").IClientePotencial[]>;
    obtenerEtapaActualLead(id_lead: number): Promise<any>;
    finalizarEtapaLead(id_lead_etapa: number): Promise<any>;
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
    finalizarEtapaOportunidadDesistio(data: {
        id_lead: number;
        motivo?: number;
    }): Promise<any>;
    obtenerInfoDesistioLead(idLead: number): Promise<any>;
    agendarReunion(body: {
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
    finalizarEtapaNegociacion(id_lead: number): Promise<any>;
    listarActividadesAsesores(body: {
        fechaInicio?: string;
        fechaFin?: string;
        idAsesor?: number;
        idTipoActividad?: number;
        estado?: number;
    }): Promise<any>;
    obtenerActividadLead(body: {
        idLead: number;
    }): Promise<any>;
    actualizarFechaHoraActividad(body: {
        idActividad: number;
        fecha: string;
        hora: string;
    }): Promise<any>;
    finalizarEtapaContactoAgendarReunion(data: {
        id_lead: number;
    }): Promise<any>;
    obtenerInfoAgendarReuLead(idLead: number): Promise<any>;
    registrarWhatsappReunion(data: {
        id_estado_reunion: number;
        fecha: string;
        hora: string;
        tipo_historial: number;
    }): Promise<any>;
    registrarCorreoReunion(data: {
        id_estado_reunion: number;
        url_evidencia: string;
        mensaje?: string;
        tipo_historial: number;
    }): Promise<any>;
    obtenerHistorialCorreoReunion(id_estado_reunion: number, tipo_historial: number): Promise<any>;
    obtenerHistorialWhatsappReunion(id_estado_reunion: number, tipo_historial: number): Promise<any>;
    obtenerTodasActividades(id_lead: number): Promise<any>;
    finalizarEtapaAtencion(id_lead: number): Promise<any>;
    actualizarChecklistNegociacion(id_lead_etapa: number, campo: string, valor: boolean): Promise<any>;
    obtenerChecklistNegociacion(id_lead: number): Promise<any>;
    actualizarChecklistCierre(id_lead_etapa: number, campo: string, valor: boolean): Promise<any>;
    obtenerChecklistCierre(id_lead: number): Promise<any>;
}
