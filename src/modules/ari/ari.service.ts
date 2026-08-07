import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ColaRepository } from './repository/cola.repository';
import { ColaRequestDto } from './dto/cola.dto';
import { LlamadasRepository } from './repository/llamadas.repository';
import { GrabacionesRepository } from './repository/grabaciones.repository';
import { LlamadasRequestDto } from './dto/llamadas.dto';
import { GrabacionesRequestDto } from './dto/grabaciones.dto';
import {
  ContactoPredictivo,
  ContarAgentesDisponiblesRequestDto,
  ContarLlamadasEnCursoRequestDto,
  MarcadorRequestDto,
  ObtenerDatosProcesoRequestDto,
  RecuperarZombiesRequestDto,
  TomarContactosPredictvoRequestDto,
} from './dto/marcador.dto';
import { MarcadorRepository } from './repository/marcador.repository';

@Injectable()
export class AriService {
  constructor(
    private readonly colaService: ColaRepository,
    private readonly llamadasService: LlamadasRepository,
    private readonly grabacionesService: GrabacionesRepository,
    private readonly marcadorService: MarcadorRepository,
  ) {}

  /* Servicios de Colas de llamadas */
  async registroTomado(
    data: ColaRequestDto,
    id_usuario_registro: number | null,
  ) {
    try {
      const result = await this.colaService.ari_tomar_registro(
        data.id,
        id_usuario_registro,
      );

      if (!result) {
        throw new InternalServerErrorException(
          'Error inesperado al registrar la cola de llamadas',
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async manejarNoContesta(data: ColaRequestDto) {
    try {
      const result = await this.colaService.ari_manejar_no_contesta(data.id);
      if (!result) {
        throw new InternalServerErrorException(
          'Error al colgar la llamada.',
          result,
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async marcarTrunkLleno(data: ColaRequestDto) {
    try {
      const result = await this.colaService.ari_marcar_trunk_lleno(data.id);
      if (!result) {
        throw new InternalServerErrorException(
          'Error en el proceso de marcacion',
          result,
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  /* Servicio de llamadas */
  async crearRegistroLlamada(
    data: LlamadasRequestDto,
    id_usuario_registro: number | null,
  ) {
    try {
      const result = await this.llamadasService.ari_crear_registro_llamada(
        data.id_contacto,
        data.id_trabajador,
        data.id_campania,
        data.numero_intento,
        id_usuario_registro,
        data.id_proceso_saliente,
      );

      if (!result) {
        throw new InternalServerErrorException('Error al registrar llamada');
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async finalizarLlamada(data: LlamadasRequestDto) {
    try {
      const result = await this.llamadasService.ari_finalizar_llamada(
        data.id,
        data.id_grabacion,
      );
      if (!result) {
        throw new InternalServerErrorException(
          'La llamada no finalizó correctamente.',
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async marcarReintento(data: LlamadasRequestDto) {
    try {
      const result = await this.llamadasService.ari_marcar_reintento(data.id);
      if (!result) {
        throw new InternalServerErrorException(
          'Error en reintentar la llamada.',
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  /* Servicio de Grabaciones */
  async crearGrabacion(
    data: GrabacionesRequestDto,
    id_usuario_registro: number | null,
  ) {
    try {
      console.log(`🔍 [SERVICE] crearGrabacion llamado con:`, {
        call_id: data.call_id,
        id_registro_llamada: data.id_registro_llamada,
        id_usuario: id_usuario_registro,
      });

      const result = await this.grabacionesService.ari_crear_grabacion(
        data.call_id,
        data.id_registro_llamada,
        id_usuario_registro,
      );

      console.log(`🔍 [SERVICE] Resultado de ari_crear_grabacion:`, result);

      if (!result) {
        throw new InternalServerErrorException(
          'Error: ari_crear_grabacion devolvió undefined',
        );
      }

      console.log(`🔍 [SERVICE] Devolviendo:`, { idGrabacion: result });
      return { idGrabacion: result };
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async actualizarGrabacion(data: GrabacionesRequestDto) {
    try {
      const result = await this.grabacionesService.ari_actualizar_grabacion(
        data.id,
        data.duracion,
        data.url_grabacion,
      );
      if (!result) {
        throw new InternalServerErrorException(
          'Error en reintentar la llamada.',
        );
      }

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async buscarContactoPorNumero(numero: string) {
    try {
      const result =
        await this.grabacionesService.ari_buscar_contacto_por_numero(numero);

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async actualizarGrabacionLlamada(
    idRegistroLlamada: number,
    idRegistroGrabacion: number,
  ): Promise<void> {
    try {
      await this.grabacionesService.ari_actualizar_grabacion_llamada(
        idRegistroLlamada,
        idRegistroGrabacion,
      );
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  /* Servicio del Marcador Progresivo */
  async obtenerCampaniaActiva(data: MarcadorRequestDto) {
    try {
      const result = await this.marcadorService.fn_obtener_campania_activa(
        data.id_trabajador,
      );

      return result;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async tomarSiguienteContacto(data: MarcadorRequestDto) {
    try {
      const result = await this.marcadorService.fn_tomar_siguiente_contacto(
        data.id_proceso_saliente,
        data.id_trabajador,
        data.reintentos_maximos,
        data.reintentos_totales,
      );
      return result ?? null;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async finalizarRegistroCola(data: MarcadorRequestDto) {
    try {
      const result = await this.marcadorService.fn_finalizar_registro_cola(
        data.id,
        data.id_estado_cola,
      );
      if (!result) {
        throw new InternalServerErrorException(
          'Error al finalizar el registro de cola.',
        );
      }
      return result ?? null;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async liberarRegistroCola(data: MarcadorRequestDto) {
    try {
      const result = await this.marcadorService.fn_liberar_registro_cola(
        data.id,
      );
      if (!result) {
        throw new InternalServerErrorException(
          'Error al liberar el registro de cola.',
        );
      }
      return result ?? null;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async cambiarEstadoConexionAgente(data: MarcadorRequestDto) {
    try {
      const result =
        await this.marcadorService.per_cambiar_estado_conexion_agente(
          data.id_trabajador,
          data.id_estado_conexion_inicial,
        );
      if (!result) {
        throw new InternalServerErrorException(
          'Error al cambiar estado del trabajador.',
        );
      }
      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async recuperarContactosEnProceso(data: RecuperarZombiesRequestDto) {
    try {
      const result = await this.marcadorService.recuperarContactosEnProceso(
        data.id_proceso_saliente,
        data.reintentos_maximos,
      );
      if (result === null || result === undefined) {
        throw new InternalServerErrorException('Error al recuperar procesos.');
      }
      return result;
    } catch (error) {
      if (error) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async obtenerEstadoTrabajador(data: MarcadorRequestDto) {
    try {
      const result =
        await this.marcadorService.per_obtener_estado_conexion_agente(
          data.id_trabajador,
        );

      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error obteniendo estado del trabajador:', error);
      throw new InternalServerErrorException(
        'Error al obtener estado del trabajador.',
      );
    }
  }

  async obtenerProcesosPredictivos(): Promise<
    Array<{
      id: number;
      id_modo_marcacion: number;
      factor_sobremarcado: number;
      intervalo_loop_seg: number;
      reintentos_maximos: number;
      reintentos_totales: number;
    }>
  > {
    try {
      const result = await this.marcadorService.obtenerProcesosPredictivos();
      return result ?? [];
    } catch (err) {
      console.error('Error obteniendo procesos predictivos:', err);
      throw new InternalServerErrorException(
        'Error obteniendo procesos predictivos',
      );
    }
  }

  async obtenerDatosProcesoSaliente(data: ObtenerDatosProcesoRequestDto) {
    try {
      const result = await this.marcadorService.obtenerDatosProcesoSaliente(
        data.id_proceso_saliente,
      );
      return result ?? null;
    } catch (err) {
      console.error('Error obteniendo datos del proceso:', err);
      throw new InternalServerErrorException(
        'Error obteniendo datos del proceso',
      );
    }
  }

  async contarAgentesDisponibles(data: ContarAgentesDisponiblesRequestDto) {
    try {
      const result = await this.marcadorService.fn_contar_agentes_disponibles(
        data.id_proceso_saliente,
      );
      return { agentes_disponibles: result ?? 0 };
    } catch (err) {
      console.error('Error contando agentes:', err);
      throw new InternalServerErrorException('Error contando agentes');
    }
  }

  async contarLlamadasEnCurso(data: ContarLlamadasEnCursoRequestDto) {
    try {
      const result = await this.marcadorService.fn_contar_llamadas_en_curso(
        data.id_proceso_saliente,
      );
      return { en_curso: result ?? 0 };
    } catch (err) {
      console.error('Error contando llamadas en curso:', err);
      throw new InternalServerErrorException(
        'Error contando llamadas en curso',
      );
    }
  }

  async tomarContactosPredictivo(
    data: TomarContactosPredictvoRequestDto,
  ): Promise<ContactoPredictivo[]> {
    try {
      const result = await this.marcadorService.fn_tomar_contactos_predictivo(
        data.id_proceso_saliente,
        data.id_usuario,
        data.reintentos_maximos,
        data.reintentos_totales,
        data.cantidad,
      );
      return result ?? [];
    } catch (err) {
      console.error('Error tomando contactos predictivo:', err);
      throw new InternalServerErrorException(
        'Error tomando contactos predictivo',
      );
    }
  }
}
