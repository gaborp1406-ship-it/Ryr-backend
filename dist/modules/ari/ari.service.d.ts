import { ColaRepository } from './repository/cola.repository';
import { ColaRequestDto } from './dto/cola.dto';
import { LlamadasRepository } from './repository/llamadas.repository';
import { GrabacionesRepository } from './repository/grabaciones.repository';
import { LlamadasRequestDto } from './dto/llamadas.dto';
import { GrabacionesRequestDto } from './dto/grabaciones.dto';
import { ContactoPredictivo, ContarAgentesDisponiblesRequestDto, ContarLlamadasEnCursoRequestDto, MarcadorRequestDto, ObtenerDatosProcesoRequestDto, RecuperarZombiesRequestDto, TomarContactosPredictvoRequestDto } from './dto/marcador.dto';
import { MarcadorRepository } from './repository/marcador.repository';
export declare class AriService {
    private readonly colaService;
    private readonly llamadasService;
    private readonly grabacionesService;
    private readonly marcadorService;
    constructor(colaService: ColaRepository, llamadasService: LlamadasRepository, grabacionesService: GrabacionesRepository, marcadorService: MarcadorRepository);
    registroTomado(data: ColaRequestDto, id_usuario_registro: number | null): Promise<import("./interfaces/cola.interfaces").RegistroTomado>;
    manejarNoContesta(data: ColaRequestDto): Promise<import("./interfaces/cola.interfaces").ResultadoNoContesta>;
    marcarTrunkLleno(data: ColaRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    crearRegistroLlamada(data: LlamadasRequestDto, id_usuario_registro: number | null): Promise<number>;
    finalizarLlamada(data: LlamadasRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    marcarReintento(data: LlamadasRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    crearGrabacion(data: GrabacionesRequestDto, id_usuario_registro: number | null): Promise<{
        idGrabacion: number;
    }>;
    actualizarGrabacion(data: GrabacionesRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    buscarContactoPorNumero(numero: string): Promise<import("./interfaces/grabaciones.interfaces").ContactoRow | null>;
    actualizarGrabacionLlamada(idRegistroLlamada: number, idRegistroGrabacion: number): Promise<void>;
    obtenerCampaniaActiva(data: MarcadorRequestDto): Promise<import("./interfaces/cola.interfaces").CampanaActiva | null>;
    tomarSiguienteContacto(data: MarcadorRequestDto): Promise<import("./interfaces/cola.interfaces").SiguienteContacto | null>;
    finalizarRegistroCola(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    liberarRegistroCola(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    cambiarEstadoConexionAgente(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").JSONResponse>;
    recuperarContactosEnProceso(data: RecuperarZombiesRequestDto): Promise<number>;
    obtenerEstadoTrabajador(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").EstadoTrabajadorResponse | null>;
    obtenerProcesosPredictivos(): Promise<Array<{
        id: number;
        id_modo_marcacion: number;
        factor_sobremarcado: number;
        intervalo_loop_seg: number;
        reintentos_maximos: number;
        reintentos_totales: number;
    }>>;
    obtenerDatosProcesoSaliente(data: ObtenerDatosProcesoRequestDto): Promise<import("./dto/marcador.dto").DatosProcesoSaliente | null>;
    contarAgentesDisponibles(data: ContarAgentesDisponiblesRequestDto): Promise<{
        agentes_disponibles: number;
    }>;
    contarLlamadasEnCurso(data: ContarLlamadasEnCursoRequestDto): Promise<{
        en_curso: number;
    }>;
    tomarContactosPredictivo(data: TomarContactosPredictvoRequestDto): Promise<ContactoPredictivo[]>;
}
