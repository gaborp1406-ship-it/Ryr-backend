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
exports.NotificacionesController = void 0;
const common_1 = require("@nestjs/common");
const notificaciones_service_1 = require("./notificaciones.service");
let NotificacionesController = class NotificacionesController {
    notificacionesService;
    constructor(notificacionesService) {
        this.notificacionesService = notificacionesService;
    }
    listar(idAsesor) {
        return this.notificacionesService.listar(idAsesor);
    }
    marcarLeida(id) {
        return this.notificacionesService.marcarLeida(id);
    }
    marcarTodasLeidas(idAsesor) {
        return this.notificacionesService.marcarTodasLeidas(idAsesor);
    }
    eliminar(id) {
        return this.notificacionesService.eliminar(id);
    }
    eliminarTodasLeidas(idAsesor) {
        return this.notificacionesService.eliminarTodasLeidas(idAsesor);
    }
};
exports.NotificacionesController = NotificacionesController;
__decorate([
    (0, common_1.Get)(':idAsesor'),
    __param(0, (0, common_1.Param)('idAsesor', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "listar", null);
__decorate([
    (0, common_1.Patch)(':id/leida'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "marcarLeida", null);
__decorate([
    (0, common_1.Patch)('asesor/:idAsesor/leer-todas'),
    __param(0, (0, common_1.Param)('idAsesor', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "marcarTodasLeidas", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Delete)('asesor/:idAsesor/leidas'),
    __param(0, (0, common_1.Param)('idAsesor', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionesController.prototype, "eliminarTodasLeidas", null);
exports.NotificacionesController = NotificacionesController = __decorate([
    (0, common_1.Controller)('notificaciones'),
    __metadata("design:paramtypes", [notificaciones_service_1.NotificacionesService])
], NotificacionesController);
//# sourceMappingURL=notificaciones.controller.js.map