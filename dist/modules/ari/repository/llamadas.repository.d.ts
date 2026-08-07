import { DataSource } from 'typeorm';
import { Response } from "../../../interfaces/responses.interface";
export declare class LlamadasRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    ari_crear_registro_llamada(idContacto: number, idTrabajador: number, idCampania: number, intentos: number, id_usuario: number | null, id_proceso_saliente: number | null): Promise<number>;
    ari_finalizar_llamada(idRegistroLlamada: number, idGrabacion: number): Promise<Response>;
    ari_marcar_reintento(idRegistroLlamada: number): Promise<Response>;
}
