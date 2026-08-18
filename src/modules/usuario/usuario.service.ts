import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioRepository } from './repository/usuario.repository';

@Injectable()
export class UsuarioService {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async registrarUsuario(data: CreateUsuarioDto) {
    try {
      const result = await this.usuarioRepository.seg_registrar_usuario(
        data.idTrabajador,
        data.usuario,
        data.contrasenia,
        data.roles,
      );

      if (!result) {
        throw new Error('Error inesperado al registrar usuario');
      }
      return result;
    } catch (error) {
      console.log('Error al registrar usuario:', error);
      throw error;
    }
  }

  async obtenerCredencialesSip(id_trabajador: number) {
    const result =
      await this.usuarioRepository.obtenerCredencialesSip(id_trabajador);
    return result;
  }
}
