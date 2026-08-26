import { ProyectosRepository } from './repository/proyectos.repository';
export declare class ProyectosService {
    private proyectoRepository;
    constructor(proyectoRepository: ProyectosRepository);
    listarProyectos(id_empresa: number): Promise<import("./interface/proyectos.interface").IOpcionesListado[] | undefined>;
}
