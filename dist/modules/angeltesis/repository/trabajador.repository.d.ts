import { DataSource } from 'typeorm';
export declare class AngelRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    fn_listar_estados_conexion(): Promise<any>;
}
