export interface Response {
    v_estado: number;
    v_detalle: string;
}
export interface AuthResponse {
    user_id: number;
    auth_status: string;
}
export interface ImportacionResponse {
    estado: number;
    mensaje: string;
    id_importacion?: number;
    resumen?: {
        insertados: number;
        duplicados: number;
        invalidos: number;
    };
    errores?: {
        fila: number;
        error: string;
    }[];
}
export interface JSONResponse {
    estado?: number;
    mensaje: string;
    id_estado_conexion_inicial?: number;
}
export interface EstadoTrabajadorResponse {
    id_estado_conexion_inicial?: number;
}
