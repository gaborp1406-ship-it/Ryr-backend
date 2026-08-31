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

  // Número que verá el cliente
  const callerId = await this.ariService.obtenerNumeroSalida(
    body.idTrabajador,
  );

  this.ariGateway.registerCall({
    extension: body.agent,
    phone: body.phone,
    agentChannelId: channelId,
    callerId,
  });

  try {
    const result = await this.ariService.call(
      body.agent,
      body.phone,
      body.idTrabajador,
      body.id_etapa_lead,
      body.tipo_historial,
      channelId,
    );

    this.ariGateway.updateCall(
      channelId,
      {
        phone: result.phone,
        idRegistroLlamada: result.idRegistroLlamada,
        callerId: result.callerId,
      },
    );

    return {
      ...result,
      channelId,
    };

  } catch (error) {
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