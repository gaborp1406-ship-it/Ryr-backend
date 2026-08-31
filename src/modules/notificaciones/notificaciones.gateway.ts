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
}