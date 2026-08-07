import { DataSource } from 'typeorm';
import { IOpcionesListado } from '../interface/opciones.interface';
export declare class OpcionesRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    gen_listado_opciones_listar(id_listado: number): Promise<IOpcionesListado[]>;
}
