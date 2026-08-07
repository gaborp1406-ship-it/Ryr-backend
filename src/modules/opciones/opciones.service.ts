import { Injectable } from '@nestjs/common';
import { OpcionesRepository } from './repository/opciones.repository';
@Injectable()
export class OpcionesService {
  constructor(private opcionesRepository: OpcionesRepository) {}

  async listarOpciones(id_listado: number) {
    try {
      const result =
        await this.opcionesRepository.gen_listado_opciones_listar(id_listado);
      if (!result) {
        throw new Error('Error inesperado al listar opciones');
      }
      return result;
    } catch (error) {
      console.log('Error al listar opciones:', error);
    }
  }
}
