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
exports.NotificacionesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let NotificacionesRepository = class NotificacionesRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async crear(data) {
        const result = await this.dataSource.query(`
      INSERT INTO com_notificaciones
        (id_asesor, id_lead, tipo, titulo, mensaje)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, id_asesor, id_lead, tipo, titulo, mensaje, leida, fecha_creacion
      `, [data.id_asesor, data.id_lead, data.tipo, data.titulo, data.mensaje]);
        return result[0];
    }
    async listarPorAsesor(idAsesor) {
        return this.dataSource.query(`
      SELECT id, id_asesor, id_lead, tipo, titulo, mensaje, leida, fecha_creacion
      FROM com_notificaciones
      WHERE id_asesor = $1
      ORDER BY fecha_creacion DESC
      LIMIT 50
      `, [idAsesor]);
    }
    async eliminar(id) {
        await this.dataSource.query(`DELETE FROM com_notificaciones WHERE id = $1`, [id]);
    }
    async eliminarTodasLeidas(idAsesor) {
        await this.dataSource.query(`DELETE FROM com_notificaciones WHERE id_asesor = $1 AND leida = TRUE`, [idAsesor]);
    }
    async marcarLeida(id) {
        await this.dataSource.query(`UPDATE com_notificaciones SET leida = TRUE WHERE id = $1`, [id]);
    }
    async marcarTodasLeidas(idAsesor) {
        await this.dataSource.query(`UPDATE com_notificaciones SET leida = TRUE WHERE id_asesor = $1 AND leida = FALSE`, [idAsesor]);
    }
};
exports.NotificacionesRepository = NotificacionesRepository;
exports.NotificacionesRepository = NotificacionesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], NotificacionesRepository);
//# sourceMappingURL=notificaciones.repository.js.map