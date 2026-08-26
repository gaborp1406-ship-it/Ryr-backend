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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_repository_1 = require("./repository/auth.repository");
let AuthService = class AuthService {
    authRepository;
    jwtService;
    constructor(authRepository, jwtService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
    }
    async getUserById(id_usuario) {
        try {
            const result = await this.authRepository.seg_usuario_get(id_usuario);
            if (!result) {
                throw new common_1.BadRequestException('Usuario no encontrado');
            }
            return result;
        }
        catch (error) {
            console.log('Error al obtener usuario por ID:', error);
        }
    }
    async login(data) {
        const { usuario, contrasenia } = data;
        try {
            const authResult = await this.authRepository.login(usuario, contrasenia);
            if (!authResult) {
                throw new common_1.BadRequestException('Error inesperado de autenticación');
            }
            switch (authResult.auth_status) {
                case 'OK': {
                    const payload = { sub: authResult.user_id };
                    return {
                        token: this.jwtService.sign(payload),
                        idusuario: authResult.user_id,
                    };
                }
                case 'CREDENCIALES_INVALIDAS':
                    throw new common_1.BadRequestException('Usuario o contraseña incorrectos');
                default:
                    throw new common_1.BadRequestException('Error inesperado de autenticación');
            }
        }
        catch (error) {
            console.log('Error al iniciar sesión:', error);
            throw error;
        }
    }
    async checkStatus(id_usuario, token) {
        try {
            const data = await this.authRepository.seg_usuario_checkstatus(id_usuario);
            if (!data || data.length === 0) {
                throw new common_1.BadRequestException('Usuario no encontrado');
            }
            return {
                auth: true,
                token: token,
                usuario: data[0],
            };
        }
        catch (error) {
            console.log('Error al verificar el estado del usuario:', error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map