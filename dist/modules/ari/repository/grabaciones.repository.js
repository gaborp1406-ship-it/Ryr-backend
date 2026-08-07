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
exports.GrabacionesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let GrabacionesRepository = class GrabacionesRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async ari_crear_grabacion(call_id, idRegistroLlamada, id_usuario) {
        const result = await this.dataSource.query(`SELECT * FROM ari_crear_grabacion($1, $2, $3)`, [call_id, idRegistroLlamada, id_usuario]);
        if (!result || !result[0]) {
            throw new Error('ari_crear_grabacion devolvió resultado vacío');
        }
        return result[0].id;
    }
    async ari_actualizar_grabacion(idGrabacion, duracionSegundos, url) {
        const h = Math.floor(duracionSegundos / 3600)
            .toString()
            .padStart(2, '0');
        const m = Math.floor((duracionSegundos % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const s = (duracionSegundos % 60).toString().padStart(2, '0');
        const result = await this.dataSource.query(`SELECT * FROM ari_actualizar_grabacion($1, $2, $3)`, [idGrabacion, `${h}:${m}:${s}`, url]);
        return result[0];
    }
    async ari_actualizar_grabacion_llamada(idRegistroLlamada, idRegistroGrabacion) {
        await this.dataSource.query(`SELECT ari_actualizar_grabacion_llamada($1, $2)`, [idRegistroLlamada, idRegistroGrabacion]);
    }
    async ari_buscar_contacto_por_numero(numero) {
        const result = await this.dataSource.query(`SELECT * FROM ari_buscar_contacto_por_numero($1)`, [numero]);
        return result[0] ?? null;
    }
};
exports.GrabacionesRepository = GrabacionesRepository;
exports.GrabacionesRepository = GrabacionesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], GrabacionesRepository);
//# sourceMappingURL=grabaciones.repository.js.map