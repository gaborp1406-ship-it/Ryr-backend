import { DataSource } from 'typeorm';
import { IOpcionesListado, IAsesor } from '../interface/asesores.interface';
export declare class AsesoresRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    gen_listar_asesor_disponible(id_trabajador: number): Promise<IOpcionesListado[]>;
    gen_listar_asesores(): Promise<IAsesor[]>;
}
