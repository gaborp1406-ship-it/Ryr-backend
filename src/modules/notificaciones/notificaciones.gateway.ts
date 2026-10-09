import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // luego pon aquí tu dominio real
  namespace: '/notificaciones',
})
export class NotificacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    const idAsesor = Number(socket.handshake.query.id_asesor);

    if (!idAsesor) {
      socket.disconnect();
      return;
    }

    // cada asesor tiene su propia "sala"
    socket.join(`asesor_${idAsesor}`);
    console.log(`Asesor ${idAsesor} conectado -> ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Socket desconectado -> ${socket.id}`);
  }

  notificarAsesor(idAsesor: number, notificacion: any) {
    this.server
      .to(`asesor_${idAsesor}`)
      .emit('nueva-notificacion', notificacion);
  }

  // NUEVO: evento silencioso (no se guarda, no suena, no aparece en la campanita)
  // El front solo quita el lead de la lista.
  emitirLeadPerdido(idAsesor: number, idLead: number) {
    this.server
      .to(`asesor_${idAsesor}`)
      .emit('lead-perdido', { id_lead: idLead });
  }
}