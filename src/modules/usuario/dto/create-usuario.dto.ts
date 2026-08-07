import {
  IsString,
  IsInt,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsuarioDto {
  @IsInt()
  idTrabajador: number;

  @IsString()
  usuario: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  contrasenia: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolesUsuarioDTO)
  @IsOptional()
  roles?: RolesUsuarioDTO[];
}

export class RolesUsuarioDTO {
  @IsInt()
  idrol: number;

  @IsInt()
  estado: number;
}
