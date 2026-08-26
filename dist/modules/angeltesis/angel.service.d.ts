import { AngelRepository } from './repository/trabajador.repository';
export declare class AngelService {
    private angelRepository;
    constructor(angelRepository: AngelRepository);
    listarEstadosConexion(): Promise<any>;
}
