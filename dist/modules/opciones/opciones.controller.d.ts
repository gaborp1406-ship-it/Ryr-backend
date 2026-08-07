import { OpcionesService } from './opciones.service';
export declare class OpcionesController {
    private readonly opcionesService;
    constructor(opcionesService: OpcionesService);
    listarOpciones(id: number): Promise<import("./interface/opciones.interface").IOpcionesListado[] | undefined>;
}
