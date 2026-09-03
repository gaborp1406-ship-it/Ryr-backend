import { IsArray, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CrearDatosRealesDto {
  @IsInt()
  id_orden: number;

  @IsNumber()
  mano_obra_real: number;

  @IsArray()
  @IsOptional()
  materiales: any[];

  @IsArray()
  @IsOptional()
  riesgos: any[];
}