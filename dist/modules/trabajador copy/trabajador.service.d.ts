import { TrabajadorRepository } from './repository/trabajador.repository';
export declare class TrabajadorService {
    private trabajadorRepository;
    constructor(trabajadorRepository: TrabajadorRepository);
    listarEstadosConexion(): Promise<any>;
    obtenerEstadoActual(id_trabajador: number): Promise<any>;
    cambiarEstado(id_trabajador: number, id_estado: number): Promise<any>;
    listarEstadoActualTrabajadores(id_estado?: number): Promise<any>;
    historialEstadoTrabajador(id_trabajador: number, id_estado?: number, fecha_desde?: string, fecha_hasta?: string): Promise<any>;
}
