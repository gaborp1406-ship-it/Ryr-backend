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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const login_usuario_dto_1 = require("./dto/login-usuario.dto");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const usuario_service_1 = require("../usuario/usuario.service");
const config_1 = require("@nestjs/config");
const jwt_auth_guard_1 = require("./guard/jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    jwtService;
    usuarioService;
    configService;
    constructor(authService, jwtService, usuarioService, configService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
        this.configService = configService;
    }
    login(loginUsuarioDto) {
        return this.authService.login(loginUsuarioDto);
    }
    checkStatus(authHeader) {
        const token = authHeader?.replace('Bearer ', '');
        if (!token) {
            throw new common_1.UnauthorizedException('Token no proporcionado');
        }
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido');
        }
        return this.authService.checkStatus(payload.sub, token);
    }
    async obtenerCredencialesSip(authHeader) {
        const token = authHeader?.replace('Bearer ', '');
        if (!token) {
            throw new common_1.UnauthorizedException('Token no proporcionado');
        }
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido');
        }
        const idTrabajador = payload.sub;
        const credenciales = await this.usuarioService.obtenerCredencialesSip(idTrabajador);
        if (!credenciales ||
            !credenciales.username ||
            !credenciales.password) {
            return {
                success: false,
                message: 'SIP no ha sido configurado',
            };
        }
        return {
            success: true,
            agentExtension: credenciales.extension,
            sipUsername: credenciales.username,
            sipPassword: credenciales.password,
            sipServer: this.configService.get('SIP_SERVER'),
            sipPort: this.configService.get('SIP_PORT'),
            expiresIn: 43200,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_usuario_dto_1.LoginUsuarioDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('checkstatus'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkStatus", null);
__decorate([
    (0, common_1.Get)('credenciales-sip'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "obtenerCredencialesSip", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        usuario_service_1.UsuarioService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map