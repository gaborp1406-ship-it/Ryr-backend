import { DataSource } from 'typeorm';
import { AuthResponse } from "../../../interfaces/responses.interface";
import { CheckStatusUsuario, Usuario } from '../interfaces/auth.interfaces';
export declare class AuthRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    login(usuario: string, contrasenia: string): Promise<AuthResponse>;
    seg_usuario_get(id_usuario: number): Promise<Usuario[]>;
    seg_usuario_checkstatus(id_usuario: number): Promise<CheckStatusUsuario[] | null>;
}
