import { NotificacionesService } from './notificaciones.service';
export declare class NotificacionesController {
    private readonly notificacionesService;
    constructor(notificacionesService: NotificacionesService);
    listar(idAsesor: number): Promise<import("./notificaciones.interface").INotificacion[]>;
    marcarLeida(id: number): Promise<void>;
    marcarTodasLeidas(idAsesor: number): Promise<void>;
    eliminar(id: number): Promise<void>;
    eliminarTodasLeidas(idAsesor: number): Promise<void>;
}
