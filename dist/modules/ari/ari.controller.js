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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriController = void 0;
const common_1 = require("@nestjs/common");
const ari_service_1 = require("./ari.service");
const ari_guard_1 = require("../auth/guard/ari.guard");
const cola_dto_1 = require("./dto/cola.dto");
const grabaciones_dto_1 = require("./dto/grabaciones.dto");
const llamadas_dto_1 = require("./dto/llamadas.dto");
const grabaciones_dto_2 = require("./dto/grabaciones.dto");
const marcador_dto_1 = require("./dto/marcador.dto");
const user_id_decorator_1 = require("../auth/decorators/user-id.decorator");
let AriController = class AriController {
    ariService;
    constructor(ariService) {
        this.ariService = ariService;
    }
    tomarRegistro(data, id_usuario_registro) {
        const idFinal = id_usuario_registro || data.id_usuario_registro || 1;
        return this.ariService.registroTomado(data, idFinal);
    }
    noContesta(data) {
        return this.ariService.manejarNoContesta(data);
    }
    trunkLleno(data) {
        return this.ariService.marcarTrunkLleno(data);
    }
    crearLlamada(data, id_usuario_registro) {
        const idFinal = id_usuario_registro || data.id_usuario_registro || 1;
        return this.ariService.crearRegistroLlamada(data, idFinal);
    }
    finalizarLlamada(data) {
        return this.ariService.finalizarLlamada(data);
    }
    marcarReintento(data) {
        return this.ariService.marcarReintento(data);
    }
    crearGrabacion(data, id_usuario_registro) {
        const idFinal = id_usuario_registro || data.id_usuario_registro || 1;
        return this.ariService.crearGrabacion(data, idFinal);
    }
    actualizarGrabacion(data) {
        return this.ariService.actualizarGrabacion(data);
    }
    buscarContactoPorNumero(data) {
        return this.ariService.buscarContactoPorNumero(data.numero);
    }
    async actualizarGrabacionLlamada(dto) {
        await this.ariService.actualizarGrabacionLlamada(dto.idRegistroLlamada, dto.idRegistroGrabacion);
        return { message: 'Grabación actualizada correctamente' };
    }
    obtenerCampaniaActiva(data) {
        return this.ariService.obtenerCampaniaActiva(data);
    }
    async tomarSiguienteContacto(data) {
        const result = await this.ariService.tomarSiguienteContacto(data);
        return result ?? null;
    }
    finalizarRegistroCola(data) {
        return this.ariService.finalizarRegistroCola(data);
    }
    liberarRegistroCola(data) {
        return this.ariService.liberarRegistroCola(data);
    }
    cambiarEstadoTrabajador(data) {
        return this.ariService.cambiarEstadoConexionAgente(data);
    }
    async recuperarZombies(data) {
        return this.ariService.recuperarContactosEnProceso(data);
    }
    obtenerEstadoTrabajador(data) {
        return this.ariService.obtenerEstadoTrabajador(data);
    }
    obtenerProcesosPredictivos() {
        return this.ariService.obtenerProcesosPredictivos();
    }
    obtenerDatosProcesoSaliente(data) {
        return this.ariService.obtenerDatosProcesoSaliente(data);
    }
    contarAgentesDisponibles(data) {
        return this.ariService.contarAgentesDisponibles(data);
    }
    contarLlamadasEnCurso(data) {
        return this.ariService.contarLlamadasEnCurso(data);
    }
    tomarContactosPredictivo(data) {
        return this.ariService.tomarContactosPredictivo(data);
    }
};
exports.AriController = AriController;
__decorate([
    (0, common_1.Post)('tomar-registro'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cola_dto_1.ColaRequestDto, Object]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "tomarRegistro", null);
__decorate([
    (0, common_1.Post)('no-contesta'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cola_dto_1.ColaRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "noContesta", null);
__decorate([
    (0, common_1.Post)('trunk-lleno'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cola_dto_1.ColaRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "trunkLleno", null);
__decorate([
    (0, common_1.Post)('crear-llamada'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [llamadas_dto_1.LlamadasRequestDto, Object]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "crearLlamada", null);
__decorate([
    (0, common_1.Post)('finalizar-llamada'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [llamadas_dto_1.LlamadasRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "finalizarLlamada", null);
__decorate([
    (0, common_1.Post)('marcar-reintento'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [llamadas_dto_1.LlamadasRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "marcarReintento", null);
__decorate([
    (0, common_1.Post)('crear-grabacion'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grabaciones_dto_1.GrabacionesRequestDto, Object]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "crearGrabacion", null);
__decorate([
    (0, common_1.Post)('actualizar-grabacion'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grabaciones_dto_1.GrabacionesRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "actualizarGrabacion", null);
__decorate([
    (0, common_1.Post)('buscar-contacto'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "buscarContactoPorNumero", null);
__decorate([
    (0, common_1.Post)('actualizar-grabacion-llamada'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grabaciones_dto_2.ActualizarGrabacionLlamadaDto]),
    __metadata("design:returntype", Promise)
], AriController.prototype, "actualizarGrabacionLlamada", null);
__decorate([
    (0, common_1.Post)('obtener-campania-activa'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.MarcadorRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "obtenerCampaniaActiva", null);
__decorate([
    (0, common_1.Post)('tomar-siguiente-contacto'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.MarcadorRequestDto]),
    __metadata("design:returntype", Promise)
], AriController.prototype, "tomarSiguienteContacto", null);
__decorate([
    (0, common_1.Post)('finalizar-registro-cola'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.MarcadorRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "finalizarRegistroCola", null);
__decorate([
    (0, common_1.Post)('liberar-registro-cola'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.MarcadorRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "liberarRegistroCola", null);
__decorate([
    (0, common_1.Post)('cambiar-estado-trabajador'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.MarcadorRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "cambiarEstadoTrabajador", null);
__decorate([
    (0, common_1.Post)('recuperar-zombies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.RecuperarZombiesRequestDto]),
    __metadata("design:returntype", Promise)
], AriController.prototype, "recuperarZombies", null);
__decorate([
    (0, common_1.Post)('obtener-estado-trabajador'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.MarcadorRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "obtenerEstadoTrabajador", null);
__decorate([
    (0, common_1.Post)('obtener-procesos-predictivos'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AriController.prototype, "obtenerProcesosPredictivos", null);
__decorate([
    (0, common_1.Post)('obtener-datos-proceso'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.ObtenerDatosProcesoRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "obtenerDatosProcesoSaliente", null);
__decorate([
    (0, common_1.Post)('contar-agentes-disponibles'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.ContarAgentesDisponiblesRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "contarAgentesDisponibles", null);
__decorate([
    (0, common_1.Post)('contar-llamadas-en-curso'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.ContarLlamadasEnCursoRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "contarLlamadasEnCurso", null);
__decorate([
    (0, common_1.Post)('tomar-contactos-predictivo'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marcador_dto_1.TomarContactosPredictvoRequestDto]),
    __metadata("design:returntype", void 0)
], AriController.prototype, "tomarContactosPredictivo", null);
exports.AriController = AriController = __decorate([
    (0, common_1.UseGuards)(ari_guard_1.AriInternalGuard),
    (0, common_1.Controller)('ari'),
    __metadata("design:paramtypes", [ari_service_1.AriService])
], AriController);
//# sourceMappingURL=ari.controller.js.map