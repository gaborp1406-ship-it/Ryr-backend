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
exports.MarcadorRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let MarcadorRepository = class MarcadorRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async fn_ari_tomar_registro(id_cola, id_usuario) {
        const result = await this.dataSource.query(`SELECT * FROM fn_ari_tomar_registro($1, $2)`, [id_cola, id_usuario]);
        return result[0] ?? null;
    }
    async ari_manejar_no_contesta(id_cola) {
        const result = await this.dataSource.query(`SELECT * FROM ari_manejar_no_contesta($1)`, [id_cola]);
        return result[0];
    }
    async ari_marcar_trunk_lleno(id_cola) {
        const result = await this.dataSource.query(`SELECT * FROM ari_marcar_trunk_lleno($1)`, [id_cola]);
        return result[0];
    }
    async fn_obtener_campania_activa(idTrabajador) {
        const result = await this.dataSource.query(`SELECT * FROM fn_obtener_campania_activa($1)`, [idTrabajador]);
        return result[0] ?? null;
    }
    async fn_tomar_siguiente_contacto(idProcesoSaliente, idTrabajador, reintentosMaximos, reintentosTotales) {
        const result = await this.dataSource.query(`SELECT * FROM fn_tomar_siguiente_contacto($1, $2, $3, $4)`, [idProcesoSaliente, idTrabajador, reintentosMaximos, reintentosTotales]);
        return result[0] ?? null;
    }
    async fn_finalizar_registro_cola(idCola, idEstadoCola) {
        const result = await this.dataSource.query(`SELECT * FROM fn_finalizar_registro_cola($1, $2)`, [idCola, idEstadoCola]);
        return result[0];
    }
    async fn_liberar_registro_cola(idCola) {
        const result = await this.dataSource.query(`SELECT * FROM fn_liberar_registro_cola($1)`, [idCola]);
        return result[0];
    }
    async per_cambiar_estado_conexion_agente(idTrabajador, idEstadoConexionInicial) {
        const result = await this.dataSource.query(`SELECT * FROM per_cambiar_estado_conexion_agente($1, $2)`, [idTrabajador, idEstadoConexionInicial]);
        return result[0];
    }
    async recuperarContactosEnProceso(idProcesoSaliente, reintentosMaximos) {
        const result = await this.dataSource.query(`SELECT fn_recuperar_contactos_en_proceso($1, $2) AS n`, [idProcesoSaliente, reintentosMaximos]);
        return result[0]?.n ?? 0;
    }
    async per_obtener_estado_conexion_agente(idTrabajador) {
        const result = await this.dataSource.query(`SELECT per_obtener_estado_conexion_agente($1) AS resultado`, [
            idTrabajador,
        ]);
        if (!result || !result[0]) {
            return null;
        }
        return result[0].resultado;
    }
    async obtenerProcesosPredictivos() {
        const result = await this.dataSource.query(`SELECT id, id_modo_marcacion, factor_sobremarcado, intervalo_loop_seg, reintentos_maximos, reintentos_totales
     FROM adm_procesos_salientes
     WHERE id_modo_marcacion = 20 AND estado = 1
     ORDER BY id`);
        return result ?? [];
    }
    async obtenerDatosProcesoSaliente(idProcesoSaliente) {
        const result = await this.dataSource.query(`SELECT id, id_campania, reintentos_maximos, reintentos_totales, factor_sobremarcado
     FROM adm_procesos_salientes
     WHERE id = $1`, [idProcesoSaliente]);
        return result[0] ?? null;
    }
    async fn_contar_agentes_disponibles(idProcesoSaliente) {
        const result = await this.dataSource.query(`SELECT fn_contar_agentes_disponibles($1) AS agentes_disponibles`, [
            idProcesoSaliente,
        ]);
        return result[0]?.agentes_disponibles ?? 0;
    }
    async fn_contar_llamadas_en_curso(idProcesoSaliente) {
        const result = await this.dataSource.query(`SELECT fn_contar_llamadas_en_curso($1) AS en_curso`, [idProcesoSaliente]);
        return result[0]?.en_curso ?? 0;
    }
    async fn_tomar_contactos_predictivo(idProcesoSaliente, idUsuario, reintentosMaximos, reintentosTotales, cantidad) {
        const result = await this.dataSource.query(`SELECT * FROM fn_tomar_contactos_predictivo($1, $2, $3, $4, $5)`, [
            idProcesoSaliente,
            idUsuario,
            reintentosMaximos,
            reintentosTotales,
            cantidad,
        ]);
        return result ?? [];
    }
};
exports.MarcadorRepository = MarcadorRepository;
exports.MarcadorRepository = MarcadorRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], MarcadorRepository);
//# sourceMappingURL=marcador.repository.js.map