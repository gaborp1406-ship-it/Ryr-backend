import { DataSource } from 'typeorm';
import { Response, JSONResponse, EstadoTrabajadorResponse } from "../../../interfaces/responses.interface";
import { RegistroTomado, ResultadoNoContesta, CampanaActiva, SiguienteContacto } from '../interfaces/cola.interfaces';
import { DatosProcesoSaliente } from '../dto/marcador.dto';
export declare class MarcadorRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    fn_ari_tomar_registro(id_cola: number, id_usuario: number | null): Promise<RegistroTomado | null>;
    ari_manejar_no_contesta(id_cola: number): Promise<ResultadoNoContesta>;
    ari_marcar_trunk_lleno(id_cola: number): Promise<Response>;
    fn_obtener_campania_activa(idTrabajador: number): Promise<CampanaActiva | null>;
    fn_tomar_siguiente_contacto(idProcesoSaliente: number, idTrabajador: number, reintentosMaximos?: number, reintentosTotales?: number): Promise<SiguienteContacto | null>;
    fn_finalizar_registro_cola(idCola: number, idEstadoCola: number): Promise<Response>;
    fn_liberar_registro_cola(idCola: number): Promise<Response>;
    per_cambiar_estado_conexion_agente(idTrabajador: number, idEstadoConexionInicial: number): Promise<JSONResponse>;
    recuperarContactosEnProceso(idProcesoSaliente: number, reintentosMaximos: number): Promise<number>;
    per_obtener_estado_conexion_agente(idTrabajador: number): Promise<EstadoTrabajadorResponse | null>;
    obtenerProcesosPredictivos(): Promise<Array<{
        id: number;
        id_modo_marcacion: number;
        factor_sobremarcado: number;
        intervalo_loop_seg: number;
        reintentos_maximos: number;
        reintentos_totales: number;
    }>>;
    obtenerDatosProcesoSaliente(idProcesoSaliente: number): Promise<DatosProcesoSaliente | null>;
    fn_contar_agentes_disponibles(idProcesoSaliente: number): Promise<number>;
    fn_contar_llamadas_en_curso(idProcesoSaliente: number): Promise<number>;
    fn_tomar_contactos_predictivo(idProcesoSaliente: number, idUsuario: number, reintentosMaximos: number, reintentosTotales: number, cantidad: number): Promise<Array<{
        id: number;
        numero: string;
        id_contacto: number;
        intentos: number;
    }>>;
}
