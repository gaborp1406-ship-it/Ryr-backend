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
exports.UsuarioRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let UsuarioRepository = class UsuarioRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async seg_registrar_usuario(idTrabajador, usuario, contrasenia, roles) {
        const rolesJson = roles ? JSON.stringify(roles) : JSON.stringify([]);
        const result = await this.dataSource.query(`SELECT * FROM seg_usuario_registrar($1, $2, $3, $4::json)`, [idTrabajador, usuario, contrasenia, rolesJson]);
        return result[0];
    }
    async obtenerCredencialesSip(id_usuario) {
        const result = await this.dataSource.query(`
    SELECT
      su.id_trabajador,
      su.extension,
      su.username,
      su.password
    FROM sip_agentes su
    WHERE su.id_trabajador = $1
      AND su.activo = true
    `, [id_usuario]);
        return result[0] || null;
    }
};
exports.UsuarioRepository = UsuarioRepository;
exports.UsuarioRepository = UsuarioRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UsuarioRepository);
//# sourceMappingURL=usuario.repository.js.map