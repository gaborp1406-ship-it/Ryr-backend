export interface Usuario {
  idusuario: number;
  usuario: string;
  nombre: string;
  apellido: string;
}

export interface JwtPayload {
  sub: number; // user ID
}

export interface CheckStatusQueryResult {
  data: CheckStatusUsuario[] | null;
}

export interface CheckStatusUsuario {
  idusuario: number;
  usuario: string;
  roles: Rol[] | null;
  id_trabajador: number | null;
  nrodocumento: string | null;
  nombre_trabajador: string | null;
  apellido_trabajador: string | null;
  celular: string | null;
  correo: string | null;
}

export interface Rol {
  idrol: number;
  nombre: string;
}
