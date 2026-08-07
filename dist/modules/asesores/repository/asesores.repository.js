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
exports.AsesoresRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AsesoresRepository = class AsesoresRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async gen_listar_asesor_disponible(id_trabajador) {
        const result = await this.dataSource.query(`SELECT * FROM fn_obtener_asesor_disponible_v2($1)`, [id_trabajador]);
        return result;
    }
    async gen_listar_asesores() {
        const result = await this.dataSource.query(`SELECT * FROM fn_listar_asesores_v2()`);
        return result;
    }
};
exports.AsesoresRepository = AsesoresRepository;
exports.AsesoresRepository = AsesoresRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AsesoresRepository);
//# sourceMappingURL=asesores.repository.js.map