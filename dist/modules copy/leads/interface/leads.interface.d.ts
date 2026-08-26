export interface ILeadDiario {
    fecha: string;
    asesor: string;
    proyecto: string;
    nombre_cliente: string;
    dni_cliente: string;
    telefono_cliente: string;
    fuente: string;
}
export interface ICrearLead {
    id_asesor: number;
    id_proyecto: number;
    nombre_cliente: string;
    dni_cliente: string;
    telefono_cliente: string;
    id_fuente: number;
    usuario_creacion: number;
}
export interface ILeadCreado {
    id_lead: number;
    id_cliente: number;
    id_asesor: number;
    fecha_creacion: string;
}
export interface IListarClientesPotenciales {
    busqueda?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    id_asesor?: number;
    id_fuente?: number;
    id_proyecto?: number;
}
export interface IClientePotencial {
    id_lead: number;
    dni_cliente: string;
    cliente: string;
    id_fuente: number;
    fuente: string;
    id_proyecto: number;
    proyecto: string;
    id_asesor: number;
    nombre_asesor: string;
    fecha_asignacion: string;
}
