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
    validarLeadDuplicado(data) {
        return this.leadService.validarLeadDuplicado(data.dni, data.telefono);
    }
    editarMensajeLeadEtapaContacto(data) {
        return this.leadService.editarMensajeLeadEtapaContacto(data.id, data.mensaje);
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
    registrarPrimerContacto(id_estado_contacto) {
        return this.leadService.registrarPrimerContacto(id_estado_contacto);
    }
    obtenerInfoEstadoReunionLead(id_lead) {
        return this.leadService.obtenerInfoEstadoReunionLead(id_lead);
    }
    obtenerHistorialCorreo(id_estado_contacto, tipo_historial) {
        return this.leadService.obtenerHistorialCorreo(id_estado_contacto, tipo_historial);
    }
    obtenerHistorialWhatsapp(id_estado_contacto, tipo_historial) {
        return this.leadService.obtenerHistorialWhatsapp(id_estado_contacto, tipo_historial);
    }
    obtenerHistorialLlamadas(id_etapa_lead, tipo_historial) {
        return this.leadService.obtenerHistorialLlamadas(id_etapa_lead, tipo_historial);
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
    finalizarEtapaOportunidadDesistio(data) {
        return this.leadService.finalizarEtapaOportunidadDesistio(data.id_lead, data.motivo);
    }
    finalizarEtapaNegociacionDesistio(data) {
        return this.leadService.finalizarEtapaNegociacionDesistio(data.id_lead, data.motivo);
    }
    finalizarEtapaCierreDesistio(data) {
        return this.leadService.finalizarEtapaCierreDesistio(data.id_lead, data.motivo);
    }
    obtenerInfoDesistioLead(idLead) {
        return this.leadService.obtenerInfoDesistioLead(idLead);
    }
    agendarReunion(body) {
        return this.leadService.agendarReunion(body);
    }
    finalizarEtapaNegociacion(id_lead) {
        return this.leadService.finalizarEtapaNegociacion(id_lead);
    }
    finalizarEtapaCierre(id_lead) {
        return this.leadService.finalizarEtapaCierre(id_lead);
    }
    listarActividadesAsesores(body) {
        return this.leadService.listarActividadesAsesores(body);
    }
    obtenerActividadLead(body) {
        return this.leadService.obtenerActividadLead(body.idLead);
    }
    actualizarFechaHoraActividad(body) {
        return this.leadService.actualizarFechaHoraActividad(body.idActividad, body.fecha, body.hora);
    }
    finalizarEtapaContactoAgendarReunion(data) {
        return this.leadService.finalizarEtapaContactoAgendarReunion(data);
    }
    obtenerInfoAgendarReuLead(idLead) {
        return this.leadService.obtenerInfoAgendarReuLead(idLead);
    }
    registrarWhatsappReunion(data) {
        return this.leadService.registrarWhatsappreunion(data);
    }
    registrarCorreoReunion(data) {
        return this.leadService.registrarCorreoreunion(data);
    }
    obtenerHistorialCorreoReunion(id_estado_reunion, tipo_historial) {
        return this.leadService.obtenerHistorialCorreoReunion(id_estado_reunion, tipo_historial);
    }
    obtenerHistorialWhatsappReunion(id_estado_reunion, tipo_historial) {
        return this.leadService.obtenerHistorialWhatsappReunion(id_estado_reunion, tipo_historial);
    }
    obtenerTodasActividades(id_lead) {
        return this.leadService.obtenerTodasActividades(id_lead);
    }
    finalizarEtapaAtencion(id_lead) {
        return this.leadService.finalizarEtapaAtencion(id_lead);
    }
    actualizarChecklistNegociacion(id_lead_etapa, campo, valor) {
        return this.leadService.actualizarChecklistNegociacion(id_lead_etapa, campo, valor);
    }
    obtenerChecklistNegociacion(id_lead) {
        return this.leadService.obtenerChecklistNegociacion(id_lead);
    }
    actualizarChecklistCierre(id_lead_etapa, campo, valor) {
        return this.leadService.actualizarChecklistCierre(id_lead_etapa, campo, valor);
    }
    obtenerChecklistCierre(id_lead) {
        return this.leadService.obtenerChecklistCierre(id_lead);
    }
    finalizarActividad(id_actividad) {
        return this.leadService.finalizarActividad(id_actividad);
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
    (0, common_1.Post)('validar-duplicado'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "validarLeadDuplicado", null);
__decorate([
    (0, common_1.Post)('editar-mensaje-lead-etapa-contacto'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "editarMensajeLeadEtapaContacto", null);
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
    (0, common_1.Get)('registrar-primer-contacto/:id_estado_contacto'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_contacto', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "registrarPrimerContacto", null);
__decorate([
    (0, common_1.Get)('info-estado-reunion/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerInfoEstadoReunionLead", null);
__decorate([
    (0, common_1.Get)('historial-correo/:id_estado_contacto/:tipo_historial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_contacto', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tipo_historial', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialCorreo", null);
__decorate([
    (0, common_1.Get)('historial-whatsapp/:id_estado_contacto/:tipo_historial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_contacto', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tipo_historial', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialWhatsapp", null);
__decorate([
    (0, common_1.Get)('historial-llamadas/:id_etapa_lead/:tipo_historial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_etapa_lead', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tipo_historial', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
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
    (0, common_1.Post)('finalizar-etapa-oportunidad-desistio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaOportunidadDesistio", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa-negociacion-desistio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaNegociacionDesistio", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa-cierre-desistio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaCierreDesistio", null);
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
    (0, common_1.Post)('finalizar-etapa-negociacion/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaNegociacion", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa-cierre/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaCierre", null);
__decorate([
    (0, common_1.Post)('listar-actividades-asesores'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "listarActividadesAsesores", null);
__decorate([
    (0, common_1.Post)('obtener-actividad-lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerActividadLead", null);
__decorate([
    (0, common_1.Post)('reprogramar-actividad'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "actualizarFechaHoraActividad", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa-contacto-agendarreunion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaContactoAgendarReunion", null);
__decorate([
    (0, common_1.Get)('obtener-info-agendarreu-lead/:idLead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('idLead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerInfoAgendarReuLead", null);
__decorate([
    (0, common_1.Post)('registrar-whatsapp-reunion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "registrarWhatsappReunion", null);
__decorate([
    (0, common_1.Post)('registrar-correo-reunion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "registrarCorreoReunion", null);
__decorate([
    (0, common_1.Get)('historial-correo/:id_estado_reunion/:tipo_historial/reunion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_reunion', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tipo_historial', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialCorreoReunion", null);
__decorate([
    (0, common_1.Get)('historial-whatsapp/:id_estado_reunion/:tipo_historial/reunion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_estado_reunion', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tipo_historial', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerHistorialWhatsappReunion", null);
__decorate([
    (0, common_1.Get)('todas-actividades/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerTodasActividades", null);
__decorate([
    (0, common_1.Post)('finalizar-etapa-atencion/:id_lead'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarEtapaAtencion", null);
__decorate([
    (0, common_1.Post)('etapa-negociacion/checklist'),
    __param(0, (0, common_1.Body)('id_lead_etapa', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('campo')),
    __param(2, (0, common_1.Body)('valor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Boolean]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "actualizarChecklistNegociacion", null);
__decorate([
    (0, common_1.Get)('etapa-negociacion/checklist/:id_lead'),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerChecklistNegociacion", null);
__decorate([
    (0, common_1.Post)('etapa-cierre/checklist'),
    __param(0, (0, common_1.Body)('id_lead_etapa', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('campo')),
    __param(2, (0, common_1.Body)('valor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Boolean]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "actualizarChecklistCierre", null);
__decorate([
    (0, common_1.Get)('etapa-cierre/checklist/:id_lead'),
    __param(0, (0, common_1.Param)('id_lead', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "obtenerChecklistCierre", null);
__decorate([
    (0, common_1.Post)('finalizar-actividad/:id_actividad'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id_actividad', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "finalizarActividad", null);
exports.LeadController = LeadController = __decorate([
    (0, common_1.Controller)('lead'),
    __metadata("design:paramtypes", [leads_service_1.LeadService])
], LeadController);
//# sourceMappingURL=leads.controller.js.map