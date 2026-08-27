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
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const lead_repository_1 = require("./repository/lead.repository");
const supabase_js_1 = require("@supabase/supabase-js");
let LeadService = class LeadService {
    leadRepository;
    supabase;
    constructor(leadRepository, supabase) {
        this.leadRepository = leadRepository;
        this.supabase = supabase;
    }
    async subirEvidenciaBase64(base64) {
        try {
            const matches = base64.match(/^data:(.+);base64,(.+)$/);
            let contentType = "image/png";
            let dataBase64 = base64;
            if (matches) {
                contentType = matches[1];
                dataBase64 = matches[2];
            }
            const buffer = Buffer.from(dataBase64, "base64");
            const extension = contentType.split("/")[1] || "png";
            const fileName = `evidencias/${Date.now()}-${Math.random()
                .toString(36)
                .substring(7)}.${extension}`;
            const { error } = await this.supabase.storage
                .from("leadsevidencia")
                .upload(fileName, buffer, {
                contentType,
                upsert: true,
            });
            if (error) {
                throw error;
            }
            const { data } = this.supabase.storage
                .from("leadsevidencia")
                .getPublicUrl(fileName);
            return data.publicUrl;
        }
        catch (error) {
            console.log("Error subiendo evidencia:", error);
            throw error;
        }
    }
    async listarleadsdiarios(id_trabajador) {
        try {
            const result = await this.leadRepository.gen_listar_lead_diarios(id_trabajador);
            if (!result) {
                throw new Error('Error inesperado al listar leads');
            }
            return result;
        }
        catch (error) {
            console.log('Error al listar leads:', error);
        }
    }
    async crearLead(data) {
        try {
            const result = await this.leadRepository.crear_lead(data);
            if (!result) {
                throw new Error('No se pudo crear el lead');
            }
            return result;
        }
        catch (error) {
            console.log('Error al crear lead:', error);
            throw error;
        }
    }
    async listarClientesPotenciales(data) {
        try {
            return await this.leadRepository.listar_clientes_potenciales(data);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async obtenerDetalleLead(id_lead) {
        try {
            const result = await this.leadRepository.obtenerDetalleLead(id_lead);
            if (!result) {
                throw new Error('No se encontró el lead.');
            }
            return result;
        }
        catch (error) {
            console.log('Error al obtener el detalle del lead:', error);
            throw error;
        }
    }
    async obtenerEtapaActualLead(id_lead) {
        try {
            const result = await this.leadRepository.obtenerEtapaActualLead(id_lead);
            if (!result || result.length === 0) {
                throw new Error('No se encontraron etapas para el lead.');
            }
            return result;
        }
        catch (error) {
            console.log('Error al obtener las etapas del lead:', error);
            throw error;
        }
    }
    async finalizarEtapaLeadAsignacion(id_lead_etapa) {
        try {
            const result = await this.leadRepository.finalizarEtapaLeadAsignacion(id_lead_etapa);
            if (!result?.finalizado) {
                throw new Error('No se pudo finalizar la etapa.');
            }
            return result;
        }
        catch (error) {
            console.log('Error al finalizar la etapa del lead:', error);
            throw error;
        }
    }
    async obtenerEstadoContactoLead(id_lead) {
        try {
            return await this.leadRepository.obtenerInfoEstadoContactoLead(id_lead);
        }
        catch (error) {
            console.log('Error al obtener el estado de contacto:', error);
            throw error;
        }
    }
    async registrarPrimerContacto(id_estado_contacto) {
        try {
            return await this.leadRepository.registrarPrimerContacto(id_estado_contacto);
        }
        catch (error) {
            console.log('Error al registrar el primer contacto:', error);
            throw error;
        }
    }
    async obtenerInfoEstadoReunionLead(id_lead) {
        try {
            return await this.leadRepository.obtenerInfoEstadoReunionLead(id_lead);
        }
        catch (error) {
            console.log('Error al obtener el estado de contacto:', error);
            throw error;
        }
    }
    async obtenerHistorialCorreo(id_estado_contacto, tipo_historial) {
        return await this.leadRepository.obtenerHistorialCorreo(id_estado_contacto, tipo_historial);
    }
    async obtenerHistorialWhatsapp(id_estado_contacto, tipo_historial) {
        return await this.leadRepository.obtenerHistorialWhatsapp(id_estado_contacto, tipo_historial);
    }
    async obtenerHistorialLlamadas(id_etapa_lead, tipo_historial) {
        return await this.leadRepository.obtenerHistorialLlamadas(id_etapa_lead, tipo_historial);
    }
    async registrarWhatsapp(data) {
        try {
            let url = data.url_evidencia;
            if (url && url.startsWith('data:')) {
                url = await this.subirEvidenciaBase64(url);
            }
            return await this.leadRepository.registrarWhatsapp({
                ...data,
                url_evidencia: url,
            });
        }
        catch (error) {
            console.log('Error al registrar whatsapp:', error);
            throw error;
        }
    }
    async registrarCorreo(data) {
        try {
            let url = data.url_evidencia;
            if (url && url.startsWith('data:')) {
                url = await this.subirEvidenciaBase64(url);
            }
            return await this.leadRepository.registrarCorreo({
                ...data,
                url_evidencia: url,
            });
        }
        catch (error) {
            console.log('Error al registrar correo:', error);
            throw error;
        }
    }
    async registrarLlamada(data) {
        try {
            return await this.leadRepository.registrarLlamada(data);
        }
        catch (error) {
            console.log('Error al registrar llamada:', error);
            throw error;
        }
    }
    async finalizarEtapaContactoDesistio(data) {
        try {
            return await this.leadRepository.finalizarEtapaContactoDesistio(data);
        }
        catch (error) {
            console.log('Error al finalizar etapa contacto desistio:', error);
            throw error;
        }
    }
    async obtenerInfoDesistioLead(idLead) {
        try {
            return await this.leadRepository.obtenerInfoDesistioLead(idLead);
        }
        catch (error) {
            console.log('Error al obtener info desistio lead:', error);
            throw error;
        }
    }
    async agendarReunion(data) {
        try {
            return await this.leadRepository.agendarReunion(data);
        }
        catch (error) {
            console.log('Error al agendar reunion:', error);
            throw error;
        }
    }
    async listarActividadesAsesores(data) {
        try {
            return await this.leadRepository.listarActividadesAsesores(data);
        }
        catch (error) {
            console.log('Error al listar actividades de asesores:', error);
            throw error;
        }
    }
    async obtenerActividadLead(idLead) {
        try {
            return await this.leadRepository.obtenerActividadLead(idLead);
        }
        catch (error) {
            console.log('Error al obtener actividades del lead:', error);
            throw error;
        }
    }
    async actualizarFechaHoraActividad(idActividad, fecha, hora) {
        try {
            return await this.leadRepository.actualizarFechaHoraActividad(idActividad, fecha, hora);
        }
        catch (error) {
            console.log('Error al actualizar fecha y hora de la actividad:', error);
            throw error;
        }
    }
    async finalizarEtapaContactoAgendarReunion(data) {
        try {
            return await this.leadRepository.finalizarEtapaContactoAgendarReunion(data);
        }
        catch (error) {
            console.log('Error al finalizar etapa contacto agendar reunión:', error);
            throw error;
        }
    }
    async obtenerInfoAgendarReuLead(idLead) {
        try {
            return await this.leadRepository.obtenerInfoAgendarReuLead(idLead);
        }
        catch (error) {
            console.log('Error al obtener información de agendar reunión:', error);
            throw error;
        }
    }
    async registrarWhatsappreunion(data) {
        try {
            return await this.leadRepository.registrarWhatsappreunion(data);
        }
        catch (error) {
            console.log('Error al registrar whatsapp:', error);
            throw error;
        }
    }
    async registrarCorreoreunion(data) {
        try {
            let url = data.url_evidencia;
            if (url && url.startsWith('data:')) {
                url = await this.subirEvidenciaBase64(url);
            }
            return await this.leadRepository.registrarCorreoreunion({
                ...data,
                url_evidencia: url,
            });
        }
        catch (error) {
            console.log('Error al registrar correo:', error);
            throw error;
        }
    }
    async obtenerHistorialCorreoReunion(id_estado_reunion, tipo_historial) {
        return await this.leadRepository.obtenerHistorialCorreoReunion(id_estado_reunion, tipo_historial);
    }
    async obtenerHistorialWhatsappReunion(id_estado_reunion, tipo_historial) {
        return await this.leadRepository.obtenerHistorialWhatsappReunion(id_estado_reunion, tipo_historial);
    }
    async obtenerTodasActividades(id_lead) {
        return await this.leadRepository.obtenerTodasActividades(id_lead);
    }
    async finalizarEtapaAtencion(id_lead) {
        return await this.leadRepository.finalizarEtapaAtencion(id_lead);
    }
    async finalizarEtapaOportunidadDesistio(id_lead, motivo) {
        return await this.leadRepository.finalizarEtapaOportunidadDesistio(id_lead, motivo);
    }
    async finalizarEtapaNegociacion(id_lead) {
        return await this.leadRepository.finalizarEtapaNegociacion(id_lead);
    }
    async actualizarChecklistNegociacion(id_lead_etapa, campo, valor) {
        return await this.leadRepository.actualizarChecklistNegociacion(id_lead_etapa, campo, valor);
    }
    async obtenerChecklistNegociacion(id_lead) {
        return await this.leadRepository.obtenerChecklistNegociacion(id_lead);
    }
    async actualizarChecklistCierre(id_lead_etapa, campo, valor) {
        return await this.leadRepository.actualizarChecklistCierre(id_lead_etapa, campo, valor);
    }
    async obtenerChecklistCierre(id_lead) {
        return await this.leadRepository.obtenerChecklistCierre(id_lead);
    }
};
exports.LeadService = LeadService;
exports.LeadService = LeadService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)("SUPABASE_CLIENT")),
    __metadata("design:paramtypes", [lead_repository_1.LeadRepository,
        supabase_js_1.SupabaseClient])
], LeadService);
//# sourceMappingURL=leads.service.js.map