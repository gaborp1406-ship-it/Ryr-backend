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
exports.NotificacionesService = void 0;
const common_1 = require("@nestjs/common");
const notificaciones_repository_1 = require("./notificaciones.repository");
const notificaciones_gateway_1 = require("./notificaciones.gateway");
let NotificacionesService = class NotificacionesService {
    notificacionesRepository;
    notificacionesGateway;
    constructor(notificacionesRepository, notificacionesGateway) {
        this.notificacionesRepository = notificacionesRepository;
        this.notificacionesGateway = notificacionesGateway;
    }
    async crearYEmitir(data) {
        const notificacion = await this.notificacionesRepository.crear(data);
        this.notificacionesGateway.notificarAsesor(data.id_asesor, notificacion);
        return notificacion;
    }
    async listar(idAsesor) {
        return this.notificacionesRepository.listarPorAsesor(idAsesor);
    }
    async marcarLeida(id) {
        return this.notificacionesRepository.marcarLeida(id);
    }
    async eliminar(id) {
        return this.notificacionesRepository.eliminar(id);
    }
    async eliminarTodasLeidas(idAsesor) {
        return this.notificacionesRepository.eliminarTodasLeidas(idAsesor);
    }
    async marcarTodasLeidas(idAsesor) {
        return this.notificacionesRepository.marcarTodasLeidas(idAsesor);
    }
};
exports.NotificacionesService = NotificacionesService;
exports.NotificacionesService = NotificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notificaciones_repository_1.NotificacionesRepository,
        notificaciones_gateway_1.NotificacionesGateway])
], NotificacionesService);
//# sourceMappingURL=notificaciones.service.js.map