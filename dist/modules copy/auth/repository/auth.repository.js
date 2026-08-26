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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AuthRepository = class AuthRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async login(usuario, contrasenia) {
        const result = await this.dataSource.query(`SELECT * FROM seg_authenticate($1, $2)`, [usuario, contrasenia]);
        return result[0];
    }
    async seg_usuario_get(id_usuario) {
        const result = await this.dataSource.query(`SELECT * FROM seg_usuario_get($1)`, [id_usuario]);
        return result;
    }
    async seg_usuario_checkstatus(id_usuario) {
        const result = await this.dataSource.query(`SELECT seg_usuario_checkstatus($1) AS data`, [id_usuario]);
        return result[0]?.data ?? null;
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map