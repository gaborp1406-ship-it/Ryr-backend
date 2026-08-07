import { OpcionesRepository } from './repository/opciones.repository';
export declare class OpcionesService {
    private opcionesRepository;
    constructor(opcionesRepository: OpcionesRepository);
    listarOpciones(id_listado: number): Promise<import("./interface/opciones.interface").IOpcionesListado[] | undefined>;
}
