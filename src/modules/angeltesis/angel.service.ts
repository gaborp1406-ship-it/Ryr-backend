import {
  Injectable,
  InternalServerErrorException,

} from '@nestjs/common';
import { AngelRepository } from './repository/trabajador.repository';

@Injectable()
export class AngelService {
  constructor(private angelRepository: AngelRepository) {}

  async listarEstadosConexion() {
    try {
      return await this.angelRepository.fn_listar_estados_conexion();
    } catch (error) {
      console.log('Error al listar estados de conexión:', error);
      throw new InternalServerErrorException(
        'Error al listar estados de conexión',
      );
    }
  }

}