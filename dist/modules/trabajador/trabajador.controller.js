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
exports.TrabajadorController = void 0;
const common_1 = require("@nestjs/common");
const trabajador_service_1 = require("./trabajador.service");
const trabajador_request_dto_1 = require("./dto/trabajador-request.dto");
const list_trabajador_dto_1 = require("./dto/list-trabajador.dto");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
let TrabajadorController = class TrabajadorController {
    TrabajadorService;
    constructor(TrabajadorService) {
        this.TrabajadorService = TrabajadorService;
    }
    registrarTrabajador(data) {
        return this.TrabajadorService.registrarTrabajador(data);
    }
    obtenerEstadoTrabajador(data) {
        return this.TrabajadorService.obtenerEstadoConexionAgente(data);
    }
    listarTrabajadoresAgentes(data) {
        return this.TrabajadorService.listarTrabajadoresAgentes(data);
    }
    cambiarEstadoConexionAgente(data) {
        return this.TrabajadorService.cambiarEstadoConexionAgente(data);
    }
    listarRoles(id_rol) {
        return this.TrabajadorService.listadoRoles(id_rol);
    }
    obtenerTrabajador(id) {
        return this.TrabajadorService.obtenerTrabajador(id);
    }
    listarEstadosConexion(id_estado_conexion) {
        return this.TrabajadorService.listadoEstadosConexion(id_estado_conexion);
    }
    obtenerTrabajadorPorCamapania(id) {
        return this.TrabajadorService.obtenerTrabajadoresPorCampania(id);
    }
};
exports.TrabajadorController = TrabajadorController;
__decorate([
    (0, common_1.Post)('registrar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trabajador_request_dto_1.TrabajadorRequestDto]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "registrarTrabajador", null);
__decorate([
    (0, common_1.Post)('obtener-estado-trabajador'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trabajador_request_dto_1.TrabajadorRequestDto]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "obtenerEstadoTrabajador", null);
__decorate([
    (0, common_1.Get)('listar-trabajadores-agentes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_trabajador_dto_1.ListTrabajadoresDTO]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "listarTrabajadoresAgentes", null);
__decorate([
    (0, common_1.Post)('cambiar-estado-conexion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trabajador_request_dto_1.TrabajadorRequestDto]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "cambiarEstadoConexionAgente", null);
__decorate([
    (0, common_1.Get)('listar-roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('id_rol', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "listarRoles", null);
__decorate([
    (0, common_1.Get)('obtener-trabajador/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "obtenerTrabajador", null);
__decorate([
    (0, common_1.Get)('listar-estados-conexion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_conexion', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "listarEstadosConexion", null);
__decorate([
    (0, common_1.Get)('obtener-trabajador-campania/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "obtenerTrabajadorPorCamapania", null);
exports.TrabajadorController = TrabajadorController = __decorate([
    (0, common_1.Controller)('trabajador'),
    __metadata("design:paramtypes", [trabajador_service_1.TrabajadorService])
], TrabajadorController);
//# sourceMappingURL=trabajador.controller.js.map