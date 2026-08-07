import { DataSource } from 'typeorm';
import { Response } from "../../../interfaces/responses.interface";
import { ContactoRow } from '../interfaces/grabaciones.interfaces';
export declare class GrabacionesRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    ari_crear_grabacion(call_id: string, idRegistroLlamada: number, id_usuario: number | null): Promise<number>;
    ari_actualizar_grabacion(idGrabacion: number, duracionSegundos: number, url: string): Promise<Response>;
    ari_actualizar_grabacion_llamada(idRegistroLlamada: number, idRegistroGrabacion: number): Promise<void>;
    ari_buscar_contacto_por_numero(numero: string): Promise<ContactoRow | null>;
}
