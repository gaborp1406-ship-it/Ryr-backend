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
exports.ProyectosRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let ProyectosRepository = class ProyectosRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async gen_listar_proyectos(id_empresa) {
        const result = await this.dataSource.query(`SELECT * FROM gen_listar_proyectos_empresa($1)`, [id_empresa]);
        return result;
    }
};
exports.ProyectosRepository = ProyectosRepository;
exports.ProyectosRepository = ProyectosRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ProyectosRepository);
//# sourceMappingURL=proyectos.repository.js.map