import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';

export class ListTrabajadoresDTO {
  @IsOptional()
  @IsInt()
  id_trabajador?: number | undefined;

  @IsOptional()
  @IsInt()
  id_estado_conexion?: number | undefined;

  @IsOptional()
  @IsString()
  busqueda?: string | undefined;

  @IsOptional()
  @IsString()
  id_campania?: number | undefined;

  @IsInt()
  @Min(0)
  @Max(10)
  limit: number;

  @IsInt()
  @Min(0)
  offset: number;
}
