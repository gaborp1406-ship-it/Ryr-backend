export interface TrabajadorDTO {
    id_trabajador: number;
    nombre_trabajador: string;
    nroDocumento: string;
    celular_personal: string;
    correo_personal: string;
    cantidad_campanias: number;
    campanias: Campania[];
    id_estado_conexion_inicial: number;
    conexion_desc: string;
    correo_usuario: string;
    id_usuario: number;
    estado: number;
    total_registros: number;
}
interface Campania {
    id: number;
    nombre: string;
}
export declare class ListTrabajadoresResponseDTO {
    data: TrabajadorDTO[];
    total: number;
}
export {};
