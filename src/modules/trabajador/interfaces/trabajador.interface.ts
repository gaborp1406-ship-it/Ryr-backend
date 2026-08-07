export interface Trabajador {
  id_trabajador: number;
  nombre_trabajador: string;
  nroDocumento: string;
  idTipoDocumento: number;
  nombre_documento: string;
  correo_personal: string;
  celular: string;
  fechaNacimiento: string;
  idUsuario: number;
  correo_usuario: string;
  id_estado_conexion_inicial: number;
  conexion_inicial_desc: string;
}

export interface RolListado {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface EstadosConexionListado {
  id: number;
  nombre: string;
  color: string;
}
