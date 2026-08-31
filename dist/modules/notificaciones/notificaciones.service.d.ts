import { NotificacionesRepository } from './notificaciones.repository';
import { NotificacionesGateway } from './notificaciones.gateway';
import { ICrearNotificacion } from './notificaciones.interface';
export declare class NotificacionesService {
    private readonly notificacionesRepository;
    private readonly notificacionesGateway;
    constructor(notificacionesRepository: NotificacionesRepository, notificacionesGateway: NotificacionesGateway);
    crearYEmitir(data: ICrearNotificacion): Promise<import("./notificaciones.interface").INotificacion>;
    listar(idAsesor: number): Promise<import("./notificaciones.interface").INotificacion[]>;
    marcarLeida(id: number): Promise<void>;
    eliminar(id: number): Promise<void>;
    eliminarTodasLeidas(idAsesor: number): Promise<void>;
    marcarTodasLeidas(idAsesor: number): Promise<void>;
}
