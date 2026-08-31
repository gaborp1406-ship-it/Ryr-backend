export interface ICrearNotificacion {
  id_asesor: number;
  id_lead: number;
  tipo: string;
  titulo: string;
  mensaje: string;
}

export interface INotificacion {
  id: number;
  id_asesor: number;
  id_lead: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}