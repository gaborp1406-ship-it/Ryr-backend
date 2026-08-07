import {
  IsString,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
export class TrabajadorRequestDto {
  @IsInt()
  idTipoDocumento: number;

  @IsString()
  nroDocumento: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  correo: string;

  @IsString()
  celular: string;

  @IsInt()
  idSucursal: number;

  @IsDateString()
  fechaNacimiento: string;

  @IsDateString()
  fechaRegistro: string;

  @IsDateString()
  fechaModificacion: string;

  @IsInt()
  @IsOptional()
  id_trabajador: number;

  @IsInt()
  @IsOptional()
  id_estado_conexion_inicial: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Campanias)
  campanias: Campanias[];
}

export class Campanias {
  @IsInt()
  id_trabajador: number;

  @IsInt()
  id_campania: number;
}
