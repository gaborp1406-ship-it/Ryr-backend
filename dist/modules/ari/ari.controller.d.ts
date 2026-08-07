import { AriService } from './ari.service';
import { ColaRequestDto } from './dto/cola.dto';
import { GrabacionesRequestDto } from './dto/grabaciones.dto';
import { LlamadasRequestDto } from './dto/llamadas.dto';
import { ActualizarGrabacionLlamadaDto } from './dto/grabaciones.dto';
import { ContarAgentesDisponiblesRequestDto, ContarLlamadasEnCursoRequestDto, MarcadorRequestDto, ObtenerDatosProcesoRequestDto, RecuperarZombiesRequestDto, TomarContactosPredictvoRequestDto } from './dto/marcador.dto';
export declare class AriController {
    private readonly ariService;
    constructor(ariService: AriService);
    tomarRegistro(data: ColaRequestDto, id_usuario_registro: number | null): Promise<import("./interfaces/cola.interfaces").RegistroTomado>;
    noContesta(data: ColaRequestDto): Promise<import("./interfaces/cola.interfaces").ResultadoNoContesta>;
    trunkLleno(data: ColaRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    crearLlamada(data: LlamadasRequestDto, id_usuario_registro: number | null): Promise<number>;
    finalizarLlamada(data: LlamadasRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    marcarReintento(data: LlamadasRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    crearGrabacion(data: GrabacionesRequestDto, id_usuario_registro: number | null): Promise<{
        idGrabacion: number;
    }>;
    actualizarGrabacion(data: GrabacionesRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    buscarContactoPorNumero(data: {
        numero: string;
    }): Promise<import("./interfaces/grabaciones.interfaces").ContactoRow | null>;
    actualizarGrabacionLlamada(dto: ActualizarGrabacionLlamadaDto): Promise<{
        message: string;
    }>;
    obtenerCampaniaActiva(data: MarcadorRequestDto): Promise<import("./interfaces/cola.interfaces").CampanaActiva | null>;
    tomarSiguienteContacto(data: MarcadorRequestDto): Promise<import("./interfaces/cola.interfaces").SiguienteContacto | null>;
    finalizarRegistroCola(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    liberarRegistroCola(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").Response>;
    cambiarEstadoTrabajador(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").JSONResponse>;
    recuperarZombies(data: RecuperarZombiesRequestDto): Promise<number>;
    obtenerEstadoTrabajador(data: MarcadorRequestDto): Promise<import("../../interfaces/responses.interface").EstadoTrabajadorResponse | null>;
    obtenerProcesosPredictivos(): Promise<{
        id: number;
        id_modo_marcacion: number;
        factor_sobremarcado: number;
        intervalo_loop_seg: number;
        reintentos_maximos: number;
        reintentos_totales: number;
    }[]>;
    obtenerDatosProcesoSaliente(data: ObtenerDatosProcesoRequestDto): Promise<import("./dto/marcador.dto").DatosProcesoSaliente | null>;
    contarAgentesDisponibles(data: ContarAgentesDisponiblesRequestDto): Promise<{
        agentes_disponibles: number;
    }>;
    contarLlamadasEnCurso(data: ContarLlamadasEnCursoRequestDto): Promise<{
        en_curso: number;
    }>;
    tomarContactosPredictivo(data: TomarContactosPredictvoRequestDto): Promise<import("./dto/marcador.dto").ContactoPredictivo[]>;
}
