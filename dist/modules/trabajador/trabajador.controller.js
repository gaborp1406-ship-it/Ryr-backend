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
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const cambiar_estado_dto_1 = require("./dto/cambiar-estado.dto");
let TrabajadorController = class TrabajadorController {
    TrabajadorService;
    constructor(TrabajadorService) {
        this.TrabajadorService = TrabajadorService;
    }
    listarEstadosConexion() {
        return this.TrabajadorService.listarEstadosConexion();
    }
    obtenerEstadoActual(id) {
        return this.TrabajadorService.obtenerEstadoActual(id);
    }
    cambiarEstado(data) {
        return this.TrabajadorService.cambiarEstado(data.id_trabajador, data.id_estado);
    }
    listarEstadoActualTrabajadores(id_estado) {
        return this.TrabajadorService.listarEstadoActualTrabajadores(id_estado ? Number(id_estado) : undefined);
    }
    historialEstadoTrabajador(id, id_estado, fecha_desde, fecha_hasta) {
        return this.TrabajadorService.historialEstadoTrabajador(id, id_estado ? Number(id_estado) : undefined, fecha_desde, fecha_hasta);
    }
};
exports.TrabajadorController = TrabajadorController;
__decorate([
    (0, common_1.Get)('estados-conexion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "listarEstadosConexion", null);
__decorate([
    (0, common_1.Get)(':id/estado-actual'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "obtenerEstadoActual", null);
__decorate([
    (0, common_1.Post)('estado/cambiar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cambiar_estado_dto_1.CambiarEstadoDto]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "cambiarEstado", null);
__decorate([
    (0, common_1.Get)('estado-actual'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('id_estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "listarEstadoActualTrabajadores", null);
__decorate([
    (0, common_1.Get)(':id/historial-estado'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('id_estado')),
    __param(2, (0, common_1.Query)('fecha_desde')),
    __param(3, (0, common_1.Query)('fecha_hasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], TrabajadorController.prototype, "historialEstadoTrabajador", null);
exports.TrabajadorController = TrabajadorController = __decorate([
    (0, common_1.Controller)('trabajador'),
    __metadata("design:paramtypes", [trabajador_service_1.TrabajadorService])
], TrabajadorController);
//# sourceMappingURL=trabajador.controller.js.map