import { DataSource } from 'typeorm';
export declare class TrabajadorRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    fn_listar_estados_conexion(): Promise<any>;
    fn_obtener_estado_actual_asesor(id_trabajador: number): Promise<any>;
    fn_cambiar_estado_asesor(id_trabajador: number, id_estado: number): Promise<any>;
    fn_listar_estado_actual_trabajadores(id_estado?: number | null): Promise<any>;
    fn_historial_estado_trabajador(id_trabajador: number, id_estado?: number | null, fecha_desde?: string | null, fecha_hasta?: string | null): Promise<any>;
}
