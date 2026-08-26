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
exports.TrabajadorService = void 0;
const common_1 = require("@nestjs/common");
const trabajador_repository_1 = require("./repository/trabajador.repository");
let TrabajadorService = class TrabajadorService {
    trabajadorRepository;
    constructor(trabajadorRepository) {
        this.trabajadorRepository = trabajadorRepository;
    }
    async listarEstadosConexion() {
        try {
            return await this.trabajadorRepository.fn_listar_estados_conexion();
        }
        catch (error) {
            console.log('Error al listar estados de conexión:', error);
            throw new common_1.InternalServerErrorException('Error al listar estados de conexión');
        }
    }
    async obtenerEstadoActual(id_trabajador) {
        try {
            const result = await this.trabajadorRepository.fn_obtener_estado_actual_asesor(id_trabajador);
            if (!result) {
                throw new common_1.BadRequestException('El trabajador no tiene un estado registrado');
            }
            return result;
        }
        catch (error) {
            console.log('Error al obtener estado actual:', error);
            throw error instanceof common_1.BadRequestException
                ? error
                : new common_1.InternalServerErrorException('Error al obtener estado actual');
        }
    }
    async cambiarEstado(id_trabajador, id_estado) {
        try {
            const result = await this.trabajadorRepository.fn_cambiar_estado_asesor(id_trabajador, id_estado);
            if (!result) {
                throw new Error('Error inesperado al cambiar estado');
            }
            return result;
        }
        catch (error) {
            console.log('Error al cambiar estado:', error);
            throw new common_1.InternalServerErrorException('Error al cambiar estado');
        }
    }
    async listarEstadoActualTrabajadores(id_estado) {
        try {
            return await this.trabajadorRepository.fn_listar_estado_actual_trabajadores(id_estado ?? null);
        }
        catch (error) {
            console.log('Error al listar estado actual de trabajadores:', error);
            throw new common_1.InternalServerErrorException('Error al listar estado actual de trabajadores');
        }
    }
    async historialEstadoTrabajador(id_trabajador, id_estado, fecha_desde, fecha_hasta) {
        try {
            return await this.trabajadorRepository.fn_historial_estado_trabajador(id_trabajador, id_estado ?? null, fecha_desde ?? null, fecha_hasta ?? null);
        }
        catch (error) {
            console.log('Error al obtener historial de estado:', error);
            throw new common_1.InternalServerErrorException('Error al obtener historial de estado');
        }
    }
};
exports.TrabajadorService = TrabajadorService;
exports.TrabajadorService = TrabajadorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trabajador_repository_1.TrabajadorRepository])
], TrabajadorService);
//# sourceMappingURL=trabajador.service.js.map