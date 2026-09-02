import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialOrdenDto {
  @IsInt()
  id_material: number;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsString()
  unidad_medida: string;
}

export class RiesgoOrdenDto {
  @IsInt()
  id_riesgo: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class CrearOrdenDto {
  @IsString()
  numero_orden: string;

  @IsString()
  descripcion_trabajo: string;

  @IsNumber()
  @IsPositive()
  mano_obra: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialOrdenDto)
  materiales: MaterialOrdenDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiesgoOrdenDto)
  riesgos: RiesgoOrdenDto[];
}