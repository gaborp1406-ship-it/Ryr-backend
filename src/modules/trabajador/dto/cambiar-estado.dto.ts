import { IsInt, IsNotEmpty } from 'class-validator';

export class CambiarEstadoDto {
  @IsInt()
  @IsNotEmpty()
  id_trabajador: number;

  @IsInt()
  @IsNotEmpty()
  id_estado: number;
}