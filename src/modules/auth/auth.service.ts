import { Injectable, BadRequestException } from '@nestjs/common';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './repository/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async getUserById(id_usuario: number) {
    try {
      const result = await this.authRepository.seg_usuario_get(id_usuario);

      if (!result) {
        throw new BadRequestException('Usuario no encontrado');
      }
      return result;
    } catch (error) {
      console.log('Error al obtener usuario por ID:', error);
    }
  }

  async login(data: LoginUsuarioDto) {
    const { usuario, contrasenia } = data;
    try {
      const authResult = await this.authRepository.login(usuario, contrasenia);

      if (!authResult) {
        throw new BadRequestException('Error inesperado de autenticación');
      }

      switch (authResult.auth_status) {
        case 'OK': {
          const payload = { sub: authResult.user_id };

          return {
            token: this.jwtService.sign(payload),
            idusuario: authResult.user_id,
          };
        }

        case 'CREDENCIALES_INVALIDAS':
          throw new BadRequestException('Usuario o contraseña incorrectos');

        default:
          throw new BadRequestException('Error inesperado de autenticación');
      }
    } catch (error) {
      console.log('Error al iniciar sesión:', error);
      throw error;
    }
  }
  async checkStatus(id_usuario: number, token: string) {
    try {
      const data =
        await this.authRepository.seg_usuario_checkstatus(id_usuario);

      if (!data || data.length === 0) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return {
        auth: true,
        token: token,
        usuario: data[0],
      };
    } catch (error) {
      console.log('Error al verificar el estado del usuario:', error);
    }
  }

  
}
