import { AsesoresService } from './asesores.service';
export declare class AsesoresController {
    private readonly asesoresService;
    constructor(asesoresService: AsesoresService);
    listarAsesorDisponible(id_trabajador: number): Promise<import("./interface/asesores.interface").IOpcionesListado[]>;
    listarAsesores(): Promise<import("./interface/asesores.interface").IAsesor[]>;
}
