import { DataSource } from 'typeorm';
import { Response } from "../../../interfaces/responses.interface";
import { RegistroTomado, ResultadoNoContesta } from '../interfaces/cola.interfaces';
export declare class ColaRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    ari_tomar_registro(idCola: number, id_usuario: number | null): Promise<RegistroTomado | null>;
    ari_manejar_no_contesta(idCola: number): Promise<ResultadoNoContesta>;
    ari_marcar_trunk_lleno(idCola: number): Promise<Response>;
}
