import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { TrabajadorRepository } from './repository/trabajador.repository';
import { LeadService } from '../leads/leads.service';

const ESTADO_ACTIVO = 1;

@Injectable()
export class TrabajadorService {
  constructor(
    private trabajadorRepository: TrabajadorRepository,
    private readonly leadService: LeadService,
  ) {}

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

  async cambiarEstado(
    id_trabajador: number,
    id_estado: number,
    usuario_creacion: number = id_trabajador,
  ) {
    let result;

    try {
      result = await this.trabajadorRepository.fn_cambiar_estado_asesor(
        id_trabajador,
        id_estado,
      );

      if (!result) {
        throw new Error('Error inesperado al cambiar estado');
      }
    } catch (error) {
      console.log('Error al cambiar estado:', error);
      throw new InternalServerErrorException('Error al cambiar estado');
    }

    // Si pasó a activo, asignar todos sus leads reservados pendientes.
    // El cambio de estado ya se confirmó: si esto falla, no debe tumbarlo.
    let reservadosAsignados = 0;

    if (id_estado === ESTADO_ACTIVO) {
      try {
        const asignados = await this.leadService.asignarLeadsReservados({
          id_importacion: null,
          id_asesor: id_trabajador,
          usuario_creacion,
        });
        reservadosAsignados = asignados.length;
      } catch (error) {
        console.log(
          `Error al asignar reservados del asesor ${id_trabajador}:`,
          error,
        );
      }
    }

    return { ...result, reservados_asignados: reservadosAsignados };
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
    id_trabajador?: number,
    id_estado?: number,
    fecha_desde?: string,
    fecha_hasta?: string,
  ) {
    try {
      return await this.trabajadorRepository.fn_historial_estado_trabajador(
        id_trabajador ?? null,
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