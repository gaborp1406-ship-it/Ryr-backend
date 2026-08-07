"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriService = void 0;
const common_1 = require("@nestjs/common");
const cola_repository_1 = require("./repository/cola.repository");
const llamadas_repository_1 = require("./repository/llamadas.repository");
const grabaciones_repository_1 = require("./repository/grabaciones.repository");
const marcador_repository_1 = require("./repository/marcador.repository");
let AriService = class AriService {
    colaService;
    llamadasService;
    grabacionesService;
    marcadorService;
    constructor(colaService, llamadasService, grabacionesService, marcadorService) {
        this.colaService = colaService;
        this.llamadasService = llamadasService;
        this.grabacionesService = grabacionesService;
        this.marcadorService = marcadorService;
    }
    async registroTomado(data, id_usuario_registro) {
        try {
            const result = await this.colaService.ari_tomar_registro(data.id, id_usuario_registro);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error inesperado al registrar la cola de llamadas');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async manejarNoContesta(data) {
        try {
            const result = await this.colaService.ari_manejar_no_contesta(data.id);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al colgar la llamada.', result);
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async marcarTrunkLleno(data) {
        try {
            const result = await this.colaService.ari_marcar_trunk_lleno(data.id);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error en el proceso de marcacion', result);
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async crearRegistroLlamada(data, id_usuario_registro) {
        try {
            const result = await this.llamadasService.ari_crear_registro_llamada(data.id_contacto, data.id_trabajador, data.id_campania, data.numero_intento, id_usuario_registro, data.id_proceso_saliente);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al registrar llamada');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async finalizarLlamada(data) {
        try {
            const result = await this.llamadasService.ari_finalizar_llamada(data.id, data.id_grabacion);
            if (!result) {
                throw new common_1.InternalServerErrorException('La llamada no finalizó correctamente.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async marcarReintento(data) {
        try {
            const result = await this.llamadasService.ari_marcar_reintento(data.id);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error en reintentar la llamada.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async crearGrabacion(data, id_usuario_registro) {
        try {
            console.log(`🔍 [SERVICE] crearGrabacion llamado con:`, {
                call_id: data.call_id,
                id_registro_llamada: data.id_registro_llamada,
                id_usuario: id_usuario_registro,
            });
            const result = await this.grabacionesService.ari_crear_grabacion(data.call_id, data.id_registro_llamada, id_usuario_registro);
            console.log(`🔍 [SERVICE] Resultado de ari_crear_grabacion:`, result);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error: ari_crear_grabacion devolvió undefined');
            }
            console.log(`🔍 [SERVICE] Devolviendo:`, { idGrabacion: result });
            return { idGrabacion: result };
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async actualizarGrabacion(data) {
        try {
            const result = await this.grabacionesService.ari_actualizar_grabacion(data.id, data.duracion, data.url_grabacion);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error en reintentar la llamada.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async buscarContactoPorNumero(numero) {
        try {
            const result = await this.grabacionesService.ari_buscar_contacto_por_numero(numero);
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async actualizarGrabacionLlamada(idRegistroLlamada, idRegistroGrabacion) {
        try {
            await this.grabacionesService.ari_actualizar_grabacion_llamada(idRegistroLlamada, idRegistroGrabacion);
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async obtenerCampaniaActiva(data) {
        try {
            const result = await this.marcadorService.fn_obtener_campania_activa(data.id_trabajador);
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async tomarSiguienteContacto(data) {
        try {
            const result = await this.marcadorService.fn_tomar_siguiente_contacto(data.id_proceso_saliente, data.id_trabajador, data.reintentos_maximos, data.reintentos_totales);
            return result ?? null;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async finalizarRegistroCola(data) {
        try {
            const result = await this.marcadorService.fn_finalizar_registro_cola(data.id, data.id_estado_cola);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al finalizar el registro de cola.');
            }
            return result ?? null;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async liberarRegistroCola(data) {
        try {
            const result = await this.marcadorService.fn_liberar_registro_cola(data.id);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al liberar el registro de cola.');
            }
            return result ?? null;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async cambiarEstadoConexionAgente(data) {
        try {
            const result = await this.marcadorService.per_cambiar_estado_conexion_agente(data.id_trabajador, data.id_estado_conexion_inicial);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al cambiar estado del trabajador.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async recuperarContactosEnProceso(data) {
        try {
            const result = await this.marcadorService.recuperarContactosEnProceso(data.id_proceso_saliente, data.reintentos_maximos);
            if (result === null || result === undefined) {
                throw new common_1.InternalServerErrorException('Error al recuperar procesos.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async obtenerEstadoTrabajador(data) {
        try {
            const result = await this.marcadorService.per_obtener_estado_conexion_agente(data.id_trabajador);
            if (!result) {
                return null;
            }
            return result;
        }
        catch (error) {
            console.error('Error obteniendo estado del trabajador:', error);
            throw new common_1.InternalServerErrorException('Error al obtener estado del trabajador.');
        }
    }
    async obtenerProcesosPredictivos() {
        try {
            const result = await this.marcadorService.obtenerProcesosPredictivos();
            return result ?? [];
        }
        catch (err) {
            console.error('Error obteniendo procesos predictivos:', err);
            throw new common_1.InternalServerErrorException('Error obteniendo procesos predictivos');
        }
    }
    async obtenerDatosProcesoSaliente(data) {
        try {
            const result = await this.marcadorService.obtenerDatosProcesoSaliente(data.id_proceso_saliente);
            return result ?? null;
        }
        catch (err) {
            console.error('Error obteniendo datos del proceso:', err);
            throw new common_1.InternalServerErrorException('Error obteniendo datos del proceso');
        }
    }
    async contarAgentesDisponibles(data) {
        try {
            const result = await this.marcadorService.fn_contar_agentes_disponibles(data.id_proceso_saliente);
            return { agentes_disponibles: result ?? 0 };
        }
        catch (err) {
            console.error('Error contando agentes:', err);
            throw new common_1.InternalServerErrorException('Error contando agentes');
        }
    }
    async contarLlamadasEnCurso(data) {
        try {
            const result = await this.marcadorService.fn_contar_llamadas_en_curso(data.id_proceso_saliente);
            return { en_curso: result ?? 0 };
        }
        catch (err) {
            console.error('Error contando llamadas en curso:', err);
            throw new common_1.InternalServerErrorException('Error contando llamadas en curso');
        }
    }
    async tomarContactosPredictivo(data) {
        try {
            const result = await this.marcadorService.fn_tomar_contactos_predictivo(data.id_proceso_saliente, data.id_usuario, data.reintentos_maximos, data.reintentos_totales, data.cantidad);
            return result ?? [];
        }
        catch (err) {
            console.error('Error tomando contactos predictivo:', err);
            throw new common_1.InternalServerErrorException('Error tomando contactos predictivo');
        }
    }
};
exports.AriService = AriService;
exports.AriService = AriService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cola_repository_1.ColaRepository,
        llamadas_repository_1.LlamadasRepository,
        grabaciones_repository_1.GrabacionesRepository,
        marcador_repository_1.MarcadorRepository])
], AriService);
//# sourceMappingURL=ari.service.js.map