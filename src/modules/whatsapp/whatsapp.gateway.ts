// whatsapp.gateway.ts
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// En producción define FRONT_ORIGIN en el .env (ej: https://crm.tudominio.com)
@WebSocketGateway({
    namespace: 'whatsapp',
    cors: { origin: process.env.FRONT_ORIGIN ?? '*' },
})
export class WhatsappGateway {
    @WebSocketServer() server!: Server;

    @SubscribeMessage('unirse-lead')
    unirse(@ConnectedSocket() client: Socket, @MessageBody() idLead: number) {
        const id = Number(idLead);
        if (Number.isFinite(id)) client.join(`lead:${id}`);
    }

    @SubscribeMessage('salir-lead')
    salir(@ConnectedSocket() client: Socket, @MessageBody() idLead: number) {
        const id = Number(idLead);
        if (Number.isFinite(id)) client.leave(`lead:${id}`);
    }

    emitirMensaje(idLead: number, mensaje: any) {
        this.server?.to(`lead:${idLead}`).emit('mensaje-nuevo', mensaje);
    }

    emitirEstado(idLead: number, data: { wa_message_id: string; estado: string }) {
        this.server?.to(`lead:${idLead}`).emit('estado-mensaje', data);
    }
}