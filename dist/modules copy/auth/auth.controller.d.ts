import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly usuarioService;
    private readonly configService;
    constructor(authService: AuthService, jwtService: JwtService, usuarioService: UsuarioService, configService: ConfigService);
    login(loginUsuarioDto: LoginUsuarioDto): Promise<{
        token: string;
        idusuario: number;
    }>;
    checkStatus(authHeader: string): Promise<{
        auth: boolean;
        token: string;
        usuario: import("./interfaces/auth.interfaces").CheckStatusUsuario;
    } | undefined>;
    obtenerCredencialesSip(authHeader: string): Promise<{
        success: boolean;
        message: string;
        agentExtension?: undefined;
        sipUsername?: undefined;
        sipPassword?: undefined;
        sipServer?: undefined;
        sipPort?: undefined;
        expiresIn?: undefined;
    } | {
        success: boolean;
        agentExtension: string;
        sipUsername: string;
        sipPassword: string;
        sipServer: string | undefined;
        sipPort: number | undefined;
        expiresIn: number;
        message?: undefined;
    }>;
}
