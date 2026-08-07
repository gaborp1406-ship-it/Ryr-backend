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
    async registrarTrabajador(data) {
        try {
            const result = await this.trabajadorRepository.per_registro_trabajador(data.idTipoDocumento, data.nroDocumento, data.nombre, data.apellido, data.correo, data.celular, data.fechaNacimiento, data.campanias, data.id_trabajador ?? null);
            if (!result) {
                throw new Error('Error inesperado al registrar trabajador');
            }
            return result;
        }
        catch (error) {
            console.log('Error al registrar trabajador:', error);
        }
    }
    async obtenerEstadoConexionAgente(data) {
        try {
            if (!data || !data.id_trabajador) {
                throw new common_1.BadRequestException('id_trabajador es requerido');
            }
            const result = await this.trabajadorRepository.per_obtener_estado_conexion_agente(data.id_trabajador);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al obtener estado del trabajador.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async listarTrabajadoresAgentes(data) {
        try {
            const result = await this.trabajadorRepository.fn_listar_trabajadores_agentes(data.id_trabajador ?? undefined, data.id_estado_conexion ?? undefined, data.busqueda ?? undefined, data.id_campania ?? undefined, data.limit ?? undefined, data.offset ?? undefined);
            console.log('Result from Repository:', result);
            if (!result.data || result.data.length === 0) {
                return { data: [], total: 0 };
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async cambiarEstadoConexionAgente(data) {
        try {
            const result = await this.trabajadorRepository.fn_cambiar_estado_conexion_agente(data.id_trabajador, data.id_estado_conexion_inicial);
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async listadoRoles(id_rol) {
        return await this.trabajadorRepository.fn_listado_roles(id_rol);
    }
    async obtenerTrabajador(id_trabajador) {
        try {
            const result = await this.trabajadorRepository.adm_obtener_trabajador(id_trabajador);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al obtener trabajador.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async listadoEstadosConexion(id_estado_conexion) {
        return await this.trabajadorRepository.fn_listado_estados_conexion(id_estado_conexion);
    }
    async obtenerTrabajadoresPorCampania(id_campania) {
        try {
            const result = await this.trabajadorRepository.fn_obtener_trabajadores_por_campania(id_campania);
            if (!result) {
                throw new common_1.InternalServerErrorException('Error al obtener los trabajadores de esta camapaña.');
            }
            return result;
        }
        catch (error) {
            if (error)
                throw error;
            throw new common_1.InternalServerErrorException(error);
        }
    }
};
exports.TrabajadorService = TrabajadorService;
exports.TrabajadorService = TrabajadorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trabajador_repository_1.TrabajadorRepository])
], TrabajadorService);
//# sourceMappingURL=trabajador.service.js.map