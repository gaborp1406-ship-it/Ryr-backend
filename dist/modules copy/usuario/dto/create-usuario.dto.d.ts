export declare class CreateUsuarioDto {
    idTrabajador: number;
    usuario: string;
    contrasenia: string;
    roles?: RolesUsuarioDTO[];
}
export declare class RolesUsuarioDTO {
    idrol: number;
    estado: number;
}
