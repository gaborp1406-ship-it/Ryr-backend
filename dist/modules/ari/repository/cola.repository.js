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
exports.ColaRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let ColaRepository = class ColaRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async ari_tomar_registro(idCola, id_usuario) {
        const result = await this.dataSource.query(`SELECT * FROM fn_ari_tomar_registro($1)`, [idCola, id_usuario]);
        return result[0] ?? null;
    }
    async ari_manejar_no_contesta(idCola) {
        const result = await this.dataSource.query(`SELECT * FROM ari_manejar_no_contesta($1)`, [idCola]);
        return result[0];
    }
    async ari_marcar_trunk_lleno(idCola) {
        const result = await this.dataSource.query(`SELECT * FROM ari_marcar_trunk_lleno($1)`, [idCola]);
        return result[0];
    }
};
exports.ColaRepository = ColaRepository;
exports.ColaRepository = ColaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ColaRepository);
//# sourceMappingURL=cola.repository.js.map