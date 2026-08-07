import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioRepository } from './repository/usuario.repository';
export declare class UsuarioService {
    private usuarioRepository;
    constructor(usuarioRepository: UsuarioRepository);
    registrarUsuario(data: CreateUsuarioDto): Promise<import("../../interfaces/responses.interface").Response>;
}
