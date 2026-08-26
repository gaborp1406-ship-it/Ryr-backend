import { AngelService } from './angel.service';
export declare class AngelController {
    private readonly AngelService;
    constructor(AngelService: AngelService);
    listarEstadosConexion(): Promise<any>;
}
