import { DataSource } from 'typeorm';
import { Response } from "../../../interfaces/responses.interface";
import { UsuarioSip } from '../interfaces/usuario-sip.interface';
export declare class UsuarioRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    seg_registrar_usuario(idTrabajador: number, usuario: string, contrasenia: string, roles?: Array<{
        idrol: number;
        estado: number;
    }>): Promise<Response>;
    obtenerCredencialesSip(id_usuario: number): Promise<UsuarioSip>;
}
