import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  usuario: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  contrasenia: string;
}
