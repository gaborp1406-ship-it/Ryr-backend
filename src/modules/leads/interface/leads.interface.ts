export interface ILeadDiario {
  fecha: string;
  asesor: string;
  proyecto: string;
  nombre_cliente: string;
   dni_cliente: string | null;
  telefono_cliente: string;
  fuente: string;
}

export interface ICrearLead {
  id_asesor: number;
  id_proyecto: number;
  nombre_cliente: string;
  dni_cliente?: string | null; // opcional
  telefono_cliente: string;
  id_fuente: number;
  usuario_creacion: number;
  es_reintento?: boolean; // true cuando viene del botón "Derivar"
}


export interface ILeadCreado {
  id_lead: number | null;
  id_cliente: number;
  id_asesor: number | null;
  fecha_creacion: Date | null;
  accion: string;
  debe_notificar: boolean;
  id_lead_anterior: number | null;
  id_asesor_anterior: number | null;
  id_usuario_notificacion: number | null;
  mensaje: string;
}

export interface IListarClientesPotenciales {
  busqueda?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_asesor?: number;
  id_fuente?: number;
  id_proyecto?: number;
  id_fase?: number;
  id_etapa?: number; // NUEVO
}

// NUEVO
export interface IListarEtapas {
  id_fase?: number | null;
}

// NUEVO
export interface IEtapa {
  id: number;
  nombre: string;
}

export interface IClientePotencial {
  id_lead: number;
  dni_cliente: string | null;
  cliente: string;
  id_fuente: number;
  fuente: string;
  id_proyecto: number;
  proyecto: string;
  id_asesor: number;
  nombre_asesor: string;
  fecha_asignacion: string;
}
export interface IActualizarLeadDniProyecto {
  id_lead: number;
  dni_cliente: string | null;
  id_proyecto: number;
  usuario_modificacion: number;
}
export interface IReasignarLead {
  id_lead: number;
  id_asesor_nuevo: number;
  usuario_modificacion: number;
  motivo?: string;        // 'SIN_RESPUESTA', 'CARGA_TRABAJO', 'MANUAL'...
  observacion?: string;
}
export interface IReasignarLeadResultado {
  reasignado: boolean;
  id_asesor_anterior: number | null;
}