export declare class TrabajadorRequestDto {
    idTipoDocumento: number;
    nroDocumento: string;
    nombre: string;
    apellido: string;
    correo: string;
    celular: string;
    idSucursal: number;
    fechaNacimiento: string;
    fechaRegistro: string;
    fechaModificacion: string;
    id_trabajador: number;
    id_estado_conexion_inicial: number;
    campanias: Campanias[];
}
export declare class Campanias {
    id_trabajador: number;
    id_campania: number;
}
