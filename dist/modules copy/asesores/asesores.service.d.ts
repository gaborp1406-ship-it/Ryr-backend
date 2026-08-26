import { AsesoresRepository } from './repository/asesores.repository';
export declare class AsesoresService {
    private asesoresRepository;
    constructor(asesoresRepository: AsesoresRepository);
    listarAsesorDisponible(id_trabajador: number): Promise<import("./interface/asesores.interface").IOpcionesListado[]>;
    listarAsesores(): Promise<import("./interface/asesores.interface").IAsesor[]>;
}
