import { DataSource } from 'typeorm';
import { IOpcionesListado } from '../interface/proyectos.interface';
export declare class ProyectosRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    gen_listar_proyectos(id_empresa: number): Promise<IOpcionesListado[]>;
}
