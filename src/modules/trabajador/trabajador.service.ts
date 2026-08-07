import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TrabajadorRequestDto } from './dto/trabajador-request.dto';
import { TrabajadorRepository } from './repository/trabajador.repository';
import { ListTrabajadoresDTO } from './dto/list-trabajador.dto';
@Injectable()
export class TrabajadorService {
  constructor(private trabajadorRepository: TrabajadorRepository) {}

  async registrarTrabajador(data: TrabajadorRequestDto) {
    try {
      const result = await this.trabajadorRepository.per_registro_trabajador(
        data.idTipoDocumento,
        data.nroDocumento,
        data.nombre,
        data.apellido,
        data.correo,
        data.celular,
        data.fechaNacimiento,
        data.campanias,
        data.id_trabajador ?? null,
      );

      if (!result) {
        throw new Error('Error inesperado al registrar trabajador');
      }

      return result;
    } catch (error) {
      console.log('Error al registrar trabajador:', error);
    }
  }

  async obtenerEstadoConexionAgente(data: TrabajadorRequestDto) {
    try {
      if (!data || !data.id_trabajador) {
        throw new BadRequestException('id_trabajador es requerido');
      }

      const result =
        await this.trabajadorRepository.per_obtener_estado_conexion_agente(
          data.id_trabajador,
        );
      if (!result) {
        throw new InternalServerErrorException(
          'Error al obtener estado del trabajador.',
        );
      }
      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async listarTrabajadoresAgentes(data: ListTrabajadoresDTO) {
    try {
      const result =
        await this.trabajadorRepository.fn_listar_trabajadores_agentes(
          data.id_trabajador ?? undefined,
          data.id_estado_conexion ?? undefined,
          data.busqueda ?? undefined,
          data.id_campania ?? undefined,
          data.limit ?? undefined,
          data.offset ?? undefined,
        );

      console.log('Result from Repository:', result);
      if (!result.data || result.data.length === 0) {
        return { data: [], total: 0 };
      }

      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async cambiarEstadoConexionAgente(data: TrabajadorRequestDto) {
    try {
      const result =
        await this.trabajadorRepository.fn_cambiar_estado_conexion_agente(
          data.id_trabajador,
          data.id_estado_conexion_inicial,
        );
      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async listadoRoles(id_rol?: number) {
    return await this.trabajadorRepository.fn_listado_roles(id_rol);
  }

  async obtenerTrabajador(id_trabajador: number) {
    try {
      const result =
        await this.trabajadorRepository.adm_obtener_trabajador(id_trabajador);

      if (!result) {
        throw new InternalServerErrorException('Error al obtener trabajador.');
      }

      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async listadoEstadosConexion(id_estado_conexion?: number) {
    return await this.trabajadorRepository.fn_listado_estados_conexion(
      id_estado_conexion,
    );
  }

  async obtenerTrabajadoresPorCampania(id_campania: number) {
    try {
      const result =
        await this.trabajadorRepository.fn_obtener_trabajadores_por_campania(
          id_campania,
        );

      if (!result) {
        throw new InternalServerErrorException(
          'Error al obtener los trabajadores de esta camapaña.',
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }
}
