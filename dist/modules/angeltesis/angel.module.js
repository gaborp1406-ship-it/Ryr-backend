"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngelModule = void 0;
const common_1 = require("@nestjs/common");
const angel_controller_1 = require("./angel.controller");
const angel_service_1 = require("./angel.service");
const trabajador_repository_1 = require("./repository/trabajador.repository");
let AngelModule = class AngelModule {
};
exports.AngelModule = AngelModule;
exports.AngelModule = AngelModule = __decorate([
    (0, common_1.Module)({
        controllers: [angel_controller_1.AngelController],
        providers: [angel_service_1.AngelService, trabajador_repository_1.AngelRepository],
    })
], AngelModule);
//# sourceMappingURL=angel.module.js.map