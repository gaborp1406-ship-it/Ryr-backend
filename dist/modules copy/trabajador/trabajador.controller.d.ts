import { TrabajadorService } from './trabajador.service';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
export declare class TrabajadorController {
    private readonly TrabajadorService;
    constructor(TrabajadorService: TrabajadorService);
    listarEstadosConexion(): Promise<any>;
    obtenerEstadoActual(id: number): Promise<any>;
    cambiarEstado(data: CambiarEstadoDto): Promise<any>;
    listarEstadoActualTrabajadores(id_estado?: string): Promise<any>;
    historialEstadoTrabajador(id: number, id_estado?: string, fecha_desde?: string, fecha_hasta?: string): Promise<any>;
}
