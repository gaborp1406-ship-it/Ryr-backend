import { Injectable } from '@nestjs/common';
import { NotificacionesRepository } from './notificaciones.repository';
import { NotificacionesGateway } from './notificaciones.gateway';
import { ICrearNotificacion } from './notificaciones.interface';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly notificacionesRepository: NotificacionesRepository,
    private readonly notificacionesGateway: NotificacionesGateway,
  ) {}

  async crearYEmitir(data: ICrearNotificacion) {
    // 1. guardar en BD
    const notificacion = await this.notificacionesRepository.crear(data);

    // 2. emitir en tiempo real
    this.notificacionesGateway.notificarAsesor(data.id_asesor, notificacion);

    return notificacion;
  }

  async listar(idAsesor: number) {
    return this.notificacionesRepository.listarPorAsesor(idAsesor);
  }

  async marcarLeida(id: number) {
    return this.notificacionesRepository.marcarLeida(id);
  }
async eliminar(id: number) {
  return this.notificacionesRepository.eliminar(id);
}

async eliminarTodasLeidas(idAsesor: number) {
  return this.notificacionesRepository.eliminarTodasLeidas(idAsesor);
}
  async marcarTodasLeidas(idAsesor: number) {
    return this.notificacionesRepository.marcarTodasLeidas(idAsesor);
  }
}