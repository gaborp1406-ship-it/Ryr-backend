import { IsInt, IsOptional } from 'class-validator';
export class ColaRequestDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  id_usuario_registro: number;
}
