import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './repository/auth.repository';
export declare class AuthService {
    private authRepository;
    private jwtService;
    constructor(authRepository: AuthRepository, jwtService: JwtService);
    getUserById(id_usuario: number): Promise<import("./interfaces/auth.interfaces").Usuario[] | undefined>;
    login(data: LoginUsuarioDto): Promise<{
        token: string;
        idusuario: number;
    }>;
    checkStatus(id_usuario: number, token: string): Promise<{
        auth: boolean;
        token: string;
        usuario: import("./interfaces/auth.interfaces").CheckStatusUsuario;
    } | undefined>;
}
