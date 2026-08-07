import { IsInt, IsOptional } from 'class-validator';
export class LlamadasRequestDto {
  @IsInt()
  id: number;

  @IsInt()
  id_contacto: number;

  @IsInt()
  id_trabajador: number;

  @IsInt()
  id_campania: number;

  @IsInt()
  numero_intento: number;

  @IsInt()
  id_grabacion: number;

  @IsOptional()
  @IsInt()
  id_usuario_registro: number;

  @IsOptional()
  @IsInt()
  id_proceso_saliente: number;
}
