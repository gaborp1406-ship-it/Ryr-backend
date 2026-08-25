import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { TrabajadorRepository } from './repository/trabajador.repository';


@Injectable()
export class TrabajadorService {
  constructor(private trabajadorRepository: TrabajadorRepository) {}


  // ---------- ESTADOS DE CONEXIÓN ----------

  async listarEstadosConexion() {
    try {
      return await this.trabajadorRepository.fn_listar_estados_conexion();
    } catch (error) {
      console.log('Error al listar estados de conexión:', error);
      throw new InternalServerErrorException(
        'Error al listar estados de conexión',
      );
    }
  }

  async obtenerEstadoActual(id_trabajador: number) {
    try {
      const result =
        await this.trabajadorRepository.fn_obtener_estado_actual_asesor(
          id_trabajador,
        );

      if (!result) {
        throw new BadRequestException(
          'El trabajador no tiene un estado registrado',
        );
      }

      return result;
    } catch (error) {
      console.log('Error al obtener estado actual:', error);
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Error al obtener estado actual');
    }
  }

  async cambiarEstado(id_trabajador: number, id_estado: number) {
    try {
      const result = await this.trabajadorRepository.fn_cambiar_estado_asesor(
        id_trabajador,
        id_estado,
      );

      if (!result) {
        throw new Error('Error inesperado al cambiar estado');
      }

      return result;
    } catch (error) {
      console.log('Error al cambiar estado:', error);
      throw new InternalServerErrorException('Error al cambiar estado');
    }
  }

  async listarEstadoActualTrabajadores(id_estado?: number) {
    try {
      return await this.trabajadorRepository.fn_listar_estado_actual_trabajadores(
        id_estado ?? null,
      );
    } catch (error) {
      console.log('Error al listar estado actual de trabajadores:', error);
      throw new InternalServerErrorException(
        'Error al listar estado actual de trabajadores',
      );
    }
  }

  async historialEstadoTrabajador(
    id_trabajador: number,
    id_estado?: number,
    fecha_desde?: string,
    fecha_hasta?: string,
  ) {
    try {
      return await this.trabajadorRepository.fn_historial_estado_trabajador(
        id_trabajador,
        id_estado ?? null,
        fecha_desde ?? null,
        fecha_hasta ?? null,
      );
    } catch (error) {
      console.log('Error al obtener historial de estado:', error);
      throw new InternalServerErrorException(
        'Error al obtener historial de estado',
      );
    }
  }
}