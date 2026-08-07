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
exports.ActualizarGrabacionLlamadaDto = exports.GrabacionesRequestDto = void 0;
const class_validator_1 = require("class-validator");
class GrabacionesRequestDto {
    id;
    call_id;
    id_registro_llamada;
    duracion;
    url_grabacion;
    id_usuario_registro;
}
exports.GrabacionesRequestDto = GrabacionesRequestDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GrabacionesRequestDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrabacionesRequestDto.prototype, "call_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GrabacionesRequestDto.prototype, "id_registro_llamada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GrabacionesRequestDto.prototype, "duracion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrabacionesRequestDto.prototype, "url_grabacion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GrabacionesRequestDto.prototype, "id_usuario_registro", void 0);
class ActualizarGrabacionLlamadaDto {
    idRegistroLlamada;
    idRegistroGrabacion;
}
exports.ActualizarGrabacionLlamadaDto = ActualizarGrabacionLlamadaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ActualizarGrabacionLlamadaDto.prototype, "idRegistroLlamada", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ActualizarGrabacionLlamadaDto.prototype, "idRegistroGrabacion", void 0);
//# sourceMappingURL=grabaciones.dto.js.map