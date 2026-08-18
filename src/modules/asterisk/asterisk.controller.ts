import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Sse,
    MessageEvent,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { AriService } from './asterisk.service';
import { AriGateway } from './asterick.gateway';
import { CallDto } from './DTO/call.dto';
import { CallEventsService } from './events/CallEventsService';

@Controller('ari')
export class AriController {
    constructor(
        private readonly ariService: AriService,
        private readonly ariGateway: AriGateway,
        private readonly callEventsService: CallEventsService,
    ) { }

    @Get('info')
    async info() {
        return this.ariService.getInfo();
    }

    @Post('call')
    async call(
        @Body() body: CallDto,
    ) {
        const channelId = uuid();

        this.ariGateway.registerCall({
            extension: body.agent,
            phone: body.phone,
            agentChannelId: channelId,
        });

        try {
            const result = await this.ariService.call(
                body.agent,
                body.phone,
                body.idTrabajador,
                channelId,
            );

            this.ariGateway.updateCall(
                channelId,
                {
                    phone: result.phone,
                    idRegistroLlamada:
                        result.idRegistroLlamada,
                },
            );

            return {
                ...result,
                channelId,
            };
        } catch (error) {
            // Si Asterisk rechazó la creación del canal, no dejamos el
            // contexto huérfano en memoria (eso generaba estado "fantasma"
            // que interfería con la próxima llamada).
            this.ariGateway.removeCall(channelId);
            throw error;
        }
    }

    @Post('hangup')
    async hangup(
        @Body() body: { channelId: string },
    ) {
        return this.ariGateway.hangupCall(
            body.channelId,
        );
    }

    @Sse('events/:extension')
    events(
        @Param('extension') extension: string,
    ): Observable<MessageEvent> {
        return this.callEventsService
            .subscribe(extension)
            .pipe(
                map((event) => ({
                    data: event,
                })),
            );
    }


    
}