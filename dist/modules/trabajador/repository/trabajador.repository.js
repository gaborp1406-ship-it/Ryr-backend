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
exports.TrabajadorRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let TrabajadorRepository = class TrabajadorRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async fn_listar_estados_conexion() {
        const result = await this.dataSource.query(`SELECT * FROM fn_listar_estados_conexion()`);
        return result;
    }
    async fn_obtener_estado_actual_asesor(id_trabajador) {
        const result = await this.dataSource.query(`SELECT * FROM fn_obtener_estado_actual_asesor($1)`, [id_trabajador]);
        return result[0] ?? null;
    }
    async fn_cambiar_estado_asesor(id_trabajador, id_estado) {
        const result = await this.dataSource.query(`SELECT * FROM fn_cambiar_estado_asesor($1, $2)`, [id_trabajador, id_estado]);
        return result[0];
    }
    async fn_listar_estado_actual_trabajadores(id_estado) {
        const result = await this.dataSource.query(`SELECT * FROM fn_listar_estado_actual_trabajadores($1)`, [id_estado ?? null]);
        return result;
    }
    async fn_historial_estado_trabajador(id_trabajador, id_estado, fecha_desde, fecha_hasta) {
        const result = await this.dataSource.query(`SELECT * FROM fn_historial_estado_trabajador($1, $2, $3, $4)`, [
            id_trabajador,
            id_estado ?? null,
            fecha_desde ?? null,
            fecha_hasta ?? null,
        ]);
        return result;
    }
};
exports.TrabajadorRepository = TrabajadorRepository;
exports.TrabajadorRepository = TrabajadorRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TrabajadorRepository);
//# sourceMappingURL=trabajador.repository.js.map