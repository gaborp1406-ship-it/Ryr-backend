import { DataSource } from 'typeorm';
import { IClientePotencial, ICrearLead, ILeadCreado, ILeadDiario, IListarClientesPotenciales } from '../interface/leads.interface';
export declare class LeadRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    gen_listar_lead_diarios(id_trabajador: number): Promise<ILeadDiario[]>;
    crear_lead(data: ICrearLead): Promise<ILeadCreado>;
    listar_clientes_potenciales(data: IListarClientesPotenciales): Promise<IClientePotencial[]>;
    obtenerEtapaActualLead(id_lead: number): Promise<any>;
    obtenerDetalleLead(id_lead: number): Promise<any>;
    finalizarEtapaLeadAsignacion(id_lead_etapa: number): Promise<any>;
    obtenerInfoEstadoContactoLead(id_lead: number): Promise<any>;
    obtenerHistorialCorreo(id_estado_contacto: number): Promise<any>;
    obtenerHistorialWhatsapp(id_estado_contacto: number): Promise<any>;
    obtenerHistorialLlamadas(id_estado_contacto: number): Promise<any>;
    registrarWhatsapp(data: {
        id_estado_contacto: number;
        url_evidencia: string;
        mensaje?: string;
    }): Promise<any>;
    registrarCorreo(data: {
        id_estado_contacto: number;
        url_evidencia: string;
        mensaje?: string;
    }): Promise<any>;
    registrarLlamada(data: any): Promise<any>;
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
}
