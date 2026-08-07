"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriModule = void 0;
const common_1 = require("@nestjs/common");
const ari_service_1 = require("./ari.service");
const ari_controller_1 = require("./ari.controller");
const cola_repository_1 = require("./repository/cola.repository");
const grabaciones_repository_1 = require("./repository/grabaciones.repository");
const llamadas_repository_1 = require("./repository/llamadas.repository");
const marcador_repository_1 = require("./repository/marcador.repository");
let AriModule = class AriModule {
};
exports.AriModule = AriModule;
exports.AriModule = AriModule = __decorate([
    (0, common_1.Module)({
        controllers: [ari_controller_1.AriController],
        providers: [
            ari_service_1.AriService,
            cola_repository_1.ColaRepository,
            grabaciones_repository_1.GrabacionesRepository,
            llamadas_repository_1.LlamadasRepository,
            marcador_repository_1.MarcadorRepository,
        ],
    })
], AriModule);
//# sourceMappingURL=ari.module.js.map