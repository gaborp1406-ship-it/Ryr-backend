import { ProyectosService } from './proyectos.service';
export declare class ProyectosController {
    private readonly proyectoService;
    constructor(proyectoService: ProyectosService);
    listarOpciones(id: number): Promise<import("./interface/proyectos.interface").IOpcionesListado[] | undefined>;
}
