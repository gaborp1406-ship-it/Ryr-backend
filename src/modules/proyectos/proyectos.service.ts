import { Injectable } from '@nestjs/common';
import { ProyectosRepository } from './repository/proyectos.repository';

@Injectable()
export class ProyectosService {
  constructor(private proyectoRepository: ProyectosRepository) {}

  async listarProyectos(id_empresa: number) {
    try {
      const result =
        await this.proyectoRepository.gen_listar_proyectos(id_empresa);
      if (!result) {
        throw new Error('Error inesperado al listar opciones');
      }
      return result;
    } catch (error) {
      console.log('Error al listar opciones:', error);
    }
  }
}
