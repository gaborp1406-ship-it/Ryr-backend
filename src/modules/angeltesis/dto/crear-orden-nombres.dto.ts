import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialNombreOrdenDto {
  @IsString()
  material: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsString()
  unidad_medida: string;
}

export class RiesgoNombreOrdenDto {
  @IsString()
  riesgo: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class CrearOrdenNombresDto {
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
  @Type(() => MaterialNombreOrdenDto)
  materiales: MaterialNombreOrdenDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiesgoNombreOrdenDto)
  riesgos: RiesgoNombreOrdenDto[];
}