import { TrabajadorRequestDto } from './dto/trabajador-request.dto';
import { TrabajadorRepository } from './repository/trabajador.repository';
import { ListTrabajadoresDTO } from './dto/list-trabajador.dto';
export declare class TrabajadorService {
    private trabajadorRepository;
    constructor(trabajadorRepository: TrabajadorRepository);
    registrarTrabajador(data: TrabajadorRequestDto): Promise<import("../../interfaces/responses.interface").Response | undefined>;
    obtenerEstadoConexionAgente(data: TrabajadorRequestDto): Promise<import("../../interfaces/responses.interface").JSONResponse>;
    listarTrabajadoresAgentes(data: ListTrabajadoresDTO): Promise<import("./dto/trabajador.dto").ListTrabajadoresResponseDTO>;
    cambiarEstadoConexionAgente(data: TrabajadorRequestDto): Promise<import("../../interfaces/responses.interface").JSONResponse>;
    listadoRoles(id_rol?: number): Promise<import("./interfaces/trabajador.interface").RolListado[]>;
    obtenerTrabajador(id_trabajador: number): Promise<import("./interfaces/trabajador.interface").Trabajador[]>;
    listadoEstadosConexion(id_estado_conexion?: number): Promise<import("./interfaces/trabajador.interface").EstadosConexionListado[]>;
    obtenerTrabajadoresPorCampania(id_campania: number): Promise<import("./interfaces/trabajador-por-campania.interface").ITrabajadorPorCampania[]>;
}
