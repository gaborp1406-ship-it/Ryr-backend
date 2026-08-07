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
exports.LlamadasRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let LlamadasRepository = class LlamadasRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async ari_crear_registro_llamada(idContacto, idTrabajador, idCampania, intentos, id_usuario, id_proceso_saliente) {
        const result = await this.dataSource.query(`SELECT * FROM ari_crear_registro_llamada($1, $2, $3, $4, $5, $6)`, [
            idContacto,
            idTrabajador,
            idCampania,
            intentos,
            id_usuario,
            id_proceso_saliente,
        ]);
        return result[0].id;
    }
    async ari_finalizar_llamada(idRegistroLlamada, idGrabacion) {
        const result = await this.dataSource.query(`SELECT * FROM ari_finalizar_llamada($1, $2)`, [idRegistroLlamada, idGrabacion]);
        return result[0];
    }
    async ari_marcar_reintento(idRegistroLlamada) {
        const result = await this.dataSource.query(`SELECT * FROM ari_marcar_reintento($1)`, [idRegistroLlamada]);
        return result[0];
    }
};
exports.LlamadasRepository = LlamadasRepository;
exports.LlamadasRepository = LlamadasRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], LlamadasRepository);
//# sourceMappingURL=llamadas.repository.js.map