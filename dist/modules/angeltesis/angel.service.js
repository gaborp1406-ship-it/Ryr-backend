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
exports.AngelService = void 0;
const common_1 = require("@nestjs/common");
const trabajador_repository_1 = require("./repository/trabajador.repository");
let AngelService = class AngelService {
    angelRepository;
    constructor(angelRepository) {
        this.angelRepository = angelRepository;
    }
    async listarEstadosConexion() {
        try {
            return await this.angelRepository.fn_listar_estados_conexion();
        }
        catch (error) {
            console.log('Error al listar estados de conexión:', error);
            throw new common_1.InternalServerErrorException('Error al listar estados de conexión');
        }
    }
};
exports.AngelService = AngelService;
exports.AngelService = AngelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trabajador_repository_1.AngelRepository])
], AngelService);
//# sourceMappingURL=angel.service.js.map