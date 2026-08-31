import { DataSource } from 'typeorm';
import { ICrearNotificacion, INotificacion } from './notificaciones.interface';
export declare class NotificacionesRepository {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    crear(data: ICrearNotificacion): Promise<INotificacion>;
    listarPorAsesor(idAsesor: number): Promise<INotificacion[]>;
    eliminar(id: number): Promise<void>;
    eliminarTodasLeidas(idAsesor: number): Promise<void>;
    marcarLeida(id: number): Promise<void>;
    marcarTodasLeidas(idAsesor: number): Promise<void>;
}
