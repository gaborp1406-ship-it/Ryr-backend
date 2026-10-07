export interface IDatosLeadPendiente {
  id_asesor: number;
  id_proyecto: number;
  nombre_cliente: string;
  dni_cliente: string;
  telefono_cliente: string;
  id_fuente: number;
  usuario_creacion: number;
}

export interface ICrearNotificacion {
  id_asesor: number;
  id_lead?: number | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos?: IDatosLeadPendiente | null;
}

export interface INotificacion {
  id: number;
  id_asesor: number;
  id_lead: number | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: Date;
  datos: IDatosLeadPendiente | null;
}