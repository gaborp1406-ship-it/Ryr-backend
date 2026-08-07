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
    async per_registro_trabajador(idTipoDocumento, nroDocumento, nombre, apellido, correo, celular, fechaNacimiento, campanias, id_trabajador) {
        const result = await this.dataSource.query(`SELECT * FROM per_registro_trabajador($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
            idTipoDocumento,
            nroDocumento,
            nombre,
            apellido,
            correo,
            celular,
            fechaNacimiento,
            campanias ? JSON.stringify(campanias) : null,
            id_trabajador || null,
        ]);
        return result[0];
    }
    async per_obtener_estado_conexion_agente(idTrabajador) {
        const [{ per_obtener_estado_conexion_agente: resp }] = await this.dataSource.query(`SELECT per_obtener_estado_conexion_agente($1)`, [idTrabajador]);
        return resp;
    }
    async fn_listar_trabajadores_agentes(id_trabajador, id_estado_conexion, busqueda, id_campania, limit = 10, offset = 0) {
        const result = await this.dataSource.query(`SELECT * FROM fn_listar_trabajadores_agentes($1, $2, $3, $4, $5, $6)`, [
            id_trabajador || null,
            id_estado_conexion || null,
            busqueda || undefined,
            id_campania || null,
            limit,
            offset,
        ]);
        const data = result[0]
            ?.fn_listar_trabajadores_agentes;
        return data || { data: [], total: 0 };
    }
    async fn_cambiar_estado_conexion_agente(id_trabajador, id_estado_conexion) {
        const result = await this.dataSource.query(`SELECT * FROM fn_cambiar_estado_conexion_agente($1, $2) AS data`, [id_trabajador, id_estado_conexion]);
        return result[0];
    }
    async fn_listado_roles(id_rol) {
        const result = await this.dataSource.query(`SELECT * FROM fn_listado_roles($1)`, [id_rol ?? null]);
        return result;
    }
    async adm_obtener_trabajador(id_trabajador) {
        const result = await this.dataSource.query(`SELECT * FROM adm_obtener_trabajador($1)`, [id_trabajador]);
        return result[0]?.adm_obtener_trabajador ?? [];
    }
    async fn_listado_estados_conexion(id_estado_conexion) {
        const result = await this.dataSource.query(`SELECT * FROM fn_listado_estados_conexion($1)`, [id_estado_conexion ?? null]);
        return result;
    }
    async fn_obtener_trabajadores_por_campania(id_campania) {
        const result = await this.dataSource.query(`SELECT * FROM fn_obtener_trabajadores_por_campania($1)`, [id_campania]);
        return result[0]?.fn_obtener_trabajadores_por_campania ?? [];
    }
};
exports.TrabajadorRepository = TrabajadorRepository;
exports.TrabajadorRepository = TrabajadorRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TrabajadorRepository);
//# sourceMappingURL=trabajador.repository.js.map