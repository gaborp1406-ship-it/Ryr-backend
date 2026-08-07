export declare class MarcadorRequestDto {
    id_trabajador: number;
    id_proceso_saliente: number;
    id_estado_conexion_inicial: number;
    id_estado_cola: number;
    id: number;
    reintentos_maximos: number;
    reintentos_totales: number;
}
export declare class RecuperarZombiesRequestDto {
    id_proceso_saliente: number;
    reintentos_maximos: number;
}
export declare class ObtenerProcesosPredictivosRequestDto {
}
export declare class ObtenerDatosProcesoRequestDto {
    id_proceso_saliente: number;
}
export declare class ContarAgentesDisponiblesRequestDto {
    id_proceso_saliente: number;
}
export declare class ContarLlamadasEnCursoRequestDto {
    id_proceso_saliente: number;
}
export declare class TomarContactosPredictvoRequestDto {
    id_proceso_saliente: number;
    id_usuario: number;
    reintentos_maximos: number;
    reintentos_totales: number;
    cantidad: number;
}
export interface ProcesoPredictivo {
    id: number;
    id_modo_marcacion: number;
    factor_sobremarcado: number;
    intervalo_loop_seg: number;
    reintentos_maximos: number;
    reintentos_totales: number;
}
export interface DatosProcesoSaliente {
    id: number;
    id_campania: number;
    reintentos_maximos: number;
    reintentos_totales: number;
    factor_sobremarcado: number;
}
export interface ContactoPredictivo {
    id: number;
    numero: string;
    id_contacto: number;
    intentos: number;
}
