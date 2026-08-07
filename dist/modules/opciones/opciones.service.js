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
exports.OpcionesService = void 0;
const common_1 = require("@nestjs/common");
const opciones_repository_1 = require("./repository/opciones.repository");
let OpcionesService = class OpcionesService {
    opcionesRepository;
    constructor(opcionesRepository) {
        this.opcionesRepository = opcionesRepository;
    }
    async listarOpciones(id_listado) {
        try {
            const result = await this.opcionesRepository.gen_listado_opciones_listar(id_listado);
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
exports.OpcionesService = OpcionesService;
exports.OpcionesService = OpcionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [opciones_repository_1.OpcionesRepository])
], OpcionesService);
//# sourceMappingURL=opciones.service.js.map