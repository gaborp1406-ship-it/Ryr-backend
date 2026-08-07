import { TrabajadorService } from './trabajador.service';
import { TrabajadorRequestDto } from './dto/trabajador-request.dto';
import { ListTrabajadoresDTO } from './dto/list-trabajador.dto';
export declare class TrabajadorController {
    private readonly TrabajadorService;
    constructor(TrabajadorService: TrabajadorService);
    registrarTrabajador(data: TrabajadorRequestDto): Promise<import("../../interfaces/responses.interface").Response | undefined>;
    obtenerEstadoTrabajador(data: TrabajadorRequestDto): Promise<import("../../interfaces/responses.interface").JSONResponse>;
    listarTrabajadoresAgentes(data: ListTrabajadoresDTO): Promise<import("./dto/trabajador.dto").ListTrabajadoresResponseDTO>;
    cambiarEstadoConexionAgente(data: TrabajadorRequestDto): Promise<import("../../interfaces/responses.interface").JSONResponse>;
    listarRoles(id_rol?: number): Promise<import("./interfaces/trabajador.interface").RolListado[]>;
    obtenerTrabajador(id: number): Promise<import("./interfaces/trabajador.interface").Trabajador[]>;
    listarEstadosConexion(id_estado_conexion?: number): Promise<import("./interfaces/trabajador.interface").EstadosConexionListado[]>;
    obtenerTrabajadorPorCamapania(id: number): Promise<import("./interfaces/trabajador-por-campania.interface").ITrabajadorPorCampania[]>;
}
