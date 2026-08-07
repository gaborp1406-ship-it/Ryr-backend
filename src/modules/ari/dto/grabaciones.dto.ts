import { IsInt, IsString, IsOptional } from 'class-validator';
export class GrabacionesRequestDto {
  @IsInt()
  id: number;

  @IsString()
  call_id: string;

  @IsInt()
  id_registro_llamada: number;

  @IsOptional()
  @IsInt()
  duracion: number;

  @IsOptional()
  @IsString()
  url_grabacion: string;

  @IsOptional()
  @IsInt()
  id_usuario_registro: number;
}

export class ActualizarGrabacionLlamadaDto {
  @IsInt()
  idRegistroLlamada: number;

  @IsInt()
  idRegistroGrabacion: number;
}
