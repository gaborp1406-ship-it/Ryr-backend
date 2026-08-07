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
exports.TomarContactosPredictvoRequestDto = exports.ContarLlamadasEnCursoRequestDto = exports.ContarAgentesDisponiblesRequestDto = exports.ObtenerDatosProcesoRequestDto = exports.ObtenerProcesosPredictivosRequestDto = exports.RecuperarZombiesRequestDto = exports.MarcadorRequestDto = void 0;
const class_validator_1 = require("class-validator");
class MarcadorRequestDto {
    id_trabajador;
    id_proceso_saliente;
    id_estado_conexion_inicial;
    id_estado_cola;
    id;
    reintentos_maximos;
    reintentos_totales;
}
exports.MarcadorRequestDto = MarcadorRequestDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "id_trabajador", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "id_proceso_saliente", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "id_estado_conexion_inicial", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "id_estado_cola", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "reintentos_maximos", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MarcadorRequestDto.prototype, "reintentos_totales", void 0);
class RecuperarZombiesRequestDto {
    id_proceso_saliente;
    reintentos_maximos;
}
exports.RecuperarZombiesRequestDto = RecuperarZombiesRequestDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RecuperarZombiesRequestDto.prototype, "id_proceso_saliente", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RecuperarZombiesRequestDto.prototype, "reintentos_maximos", void 0);
class ObtenerProcesosPredictivosRequestDto {
}
exports.ObtenerProcesosPredictivosRequestDto = ObtenerProcesosPredictivosRequestDto;
class ObtenerDatosProcesoRequestDto {
    id_proceso_saliente;
}
exports.ObtenerDatosProcesoRequestDto = ObtenerDatosProcesoRequestDto;
class ContarAgentesDisponiblesRequestDto {
    id_proceso_saliente;
}
exports.ContarAgentesDisponiblesRequestDto = ContarAgentesDisponiblesRequestDto;
class ContarLlamadasEnCursoRequestDto {
    id_proceso_saliente;
}
exports.ContarLlamadasEnCursoRequestDto = ContarLlamadasEnCursoRequestDto;
class TomarContactosPredictvoRequestDto {
    id_proceso_saliente;
    id_usuario;
    reintentos_maximos;
    reintentos_totales;
    cantidad;
}
exports.TomarContactosPredictvoRequestDto = TomarContactosPredictvoRequestDto;
//# sourceMappingURL=marcador.dto.js.map