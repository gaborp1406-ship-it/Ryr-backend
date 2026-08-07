//Marcador Progresivo
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class MarcadorRequestDto {
  @IsInt()
  id_trabajador: number;

  @IsInt()
  @IsOptional()
  id_proceso_saliente: number;

  @IsInt()
  @IsOptional()
  id_estado_conexion_inicial: number;

  @IsInt()
  @IsOptional()
  id_estado_cola: number;

  @IsInt()
  @IsOptional()
  id: number; // id del registro de cola

  @IsInt()
  @IsOptional()
  reintentos_maximos: number;

  @IsInt()
  @IsOptional()
  reintentos_totales: number;
}

export class RecuperarZombiesRequestDto {
  @IsInt()
  @IsPositive()
  id_proceso_saliente: number;

  @IsInt()
  @IsPositive()
  reintentos_maximos: number;
}

export class ObtenerProcesosPredictivosRequestDto {}

export class ObtenerDatosProcesoRequestDto {
  id_proceso_saliente: number;
}

export class ContarAgentesDisponiblesRequestDto {
  id_proceso_saliente: number;
}

export class ContarLlamadasEnCursoRequestDto {
  id_proceso_saliente: number;
}

export class TomarContactosPredictvoRequestDto {
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
