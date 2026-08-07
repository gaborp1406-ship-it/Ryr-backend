export interface RegistroTomado {
    id: number;
    intentos: number;
    id_trabajador?: number;
    id_estado_conexion_inicial?: number;
}
export interface ResultadoNoContesta {
    intentos: number;
    reintentos_maximos: number;
    agoto_reintentos: boolean;
}
export interface CampanaActiva {
    id_proceso_saliente: number;
    id_campania: number;
    reintentos_maximos: number;
    reintentos_totales: number;
    id_modo_marcacion: number;
}
export interface SiguienteContacto {
    id: number;
    numero: string;
    id_contacto: number;
    intentos: number;
}
