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
exports.LeadController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const leads_service_1 = require("./leads.service");
let LeadController = class LeadController {
    leadService;
    constructor(leadService) {
        this.leadService = leadService;
    }
    listarAsesorDisponible(id_trabajador) {
        return this.leadService.listarleadsdiarios(id_trabajador);
    }
    crearLead(data) {
        return this.leadService.crearLead(data);
    }
    obtenerDetalleLead(id_lead) {
        return this.leadService.obtenerDetalleLead(id_lead);
    }
    listarClientesPotenciales(data) {
        return this.leadService.listarClientesPotenciales(data);
    }
    obtenerEtapaActualLead(id_lead) {
        return this.leadService.obtenerEtapaActualLead(id_lead);
    }
    finalizarEtapaLead(id_lead_etapa) {
        return this.leadService.finalizarEtapaLeadAsignacion(id_lead_etapa);
    }
    obtenerEstadoContactoLead(id_lead) {
        return this.leadService.obtenerEstadoContactoLead(id_lead);
    }
    obtenerHistorialCorreo(id_estado_contacto) {
        return this.leadService.obtenerHistorialCorreo(id_estado_contacto);
    }
    obtenerHistorialWhatsapp(id_estado_contacto) {
        return this.leadService.obtenerHistorialWhatsapp(id_estado_contacto);
    }
    obtenerHistorialLlamadas(id_estado_contacto) {
        return this.leadService.obtenerHistorialLlamadas(id_estado_contacto);
    }
    registrarWhatsapp(data) {
        return this.leadService.registrarWhatsapp(data);
    }
    registrarCorreo(data) {
        return this.leadService.registrarCorreo(data);
    }
    registrarLlamada(data) {
        return this.leadService.registrarLlamada(data);
    }
    finalizarEtapaContactoDesistio(data) {
        return this.leadService.finalizarEtapaContactoDesistio(data);
    }
    obtenerInfoDesistioLead(idLead) {
        return this.leadService.obtenerInfoDesistioLead(idLead);
    }
    agendarReunion(body) {
        return this.leadService.agendarReunion(body);
    }
    listarActividadesAsesores(body) {
        return this.leadService.listarActividadesAsesores(body);
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, common_1.Get)('listar-diario/:id_trabajador'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_trabajador', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "listarAsesorDisponible", null);
__decorate([
    (0, common_1.Post)('crear'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "crearLead", null);
__decorate([
    (0, common_1.Get)('detalle/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerDetalleLead", null);
__decorate([
    (0, common_1.Post)('listar-clientes-potenciales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "listarClientesPotenciales", null);
__decorate([
    (0, common_1.Get)('obtener-etapa-actual/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerEtapaActualLead", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa/:id_lead_etapa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead_etapa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaLead", null);
__decorate([
    (0, common_1.Get)('info-estado-contacto/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerEstadoContactoLead", null);
__decorate([
    (0, common_1.Get)('historial-correo/:id_estado_contacto'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_contacto', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialCorreo", null);
__decorate([
    (0, common_1.Get)('historial-whatsapp/:id_estado_contacto'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_contacto', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialWhatsapp", null);
__decorate([
    (0, common_1.Get)('historial-llamadas/:id_estado_contacto'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_contacto', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialLlamadas", null);
__decorate([
    (0, common_1.Post)('registrar-whatsapp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "registrarWhatsapp", null);
__decorate([
    (0, common_1.Post)('registrar-correo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "registrarCorreo", null);
__decorate([
    (0, common_1.Post)('registrar-llamada'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "registrarLlamada", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa-contacto-desistio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaContactoDesistio", null);
__decorate([
    (0, common_1.Get)('info-desistio-lead/:idLead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('idLead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerInfoDesistioLead", null);
__decorate([
    (0, common_1.Post)('agendar-reunion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "agendarReunion", null);
__decorate([
    (0, common_1.Post)('listar-actividades-asesores'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "listarActividadesAsesores", null);
exports.LeadController = LeadController = __decorate([
    (0, common_1.Controller)('lead'),
    __metadata("design:paramtypes", [leads_service_1.LeadService])
], LeadController);
//# sourceMappingURL=leads.controller.js.map