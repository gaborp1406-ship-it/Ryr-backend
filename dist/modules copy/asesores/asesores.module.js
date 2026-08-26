"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsesoresModule = void 0;
const common_1 = require("@nestjs/common");
const asesores_controller_1 = require("./asesores.controller");
const asesores_repository_1 = require("./repository/asesores.repository");
const asesores_service_1 = require("./asesores.service");
let AsesoresModule = class AsesoresModule {
};
exports.AsesoresModule = AsesoresModule;
exports.AsesoresModule = AsesoresModule = __decorate([
    (0, common_1.Module)({
        controllers: [asesores_controller_1.AsesoresController],
        providers: [asesores_service_1.AsesoresService, asesores_repository_1.AsesoresRepository],
    })
], AsesoresModule);
//# sourceMappingURL=asesores.module.js.map