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
exports.ProyectosService = void 0;
const common_1 = require("@nestjs/common");
const proyectos_repository_1 = require("./repository/proyectos.repository");
let ProyectosService = class ProyectosService {
    proyectoRepository;
    constructor(proyectoRepository) {
        this.proyectoRepository = proyectoRepository;
    }
    async listarProyectos(id_empresa) {
        try {
            const result = await this.proyectoRepository.gen_listar_proyectos(id_empresa);
            if (!result) {
                throw new Error('Error inesperado al listar opciones');
            }
            return result;
        }
        catch (error) {
            console.log('Error al listar opciones:', error);
        }
    }
};
exports.ProyectosService = ProyectosService;
exports.ProyectosService = ProyectosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [proyectos_repository_1.ProyectosRepository])
], ProyectosService);
//# sourceMappingURL=proyectos.service.js.map