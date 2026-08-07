import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    login(loginUsuarioDto: LoginUsuarioDto): Promise<{
        token: string;
        idusuario: number;
    }>;
    checkStatus(authHeader: string): Promise<{
        auth: boolean;
        token: string;
        usuario: import("./interfaces/auth.interfaces").CheckStatusUsuario;
    } | undefined>;
}
