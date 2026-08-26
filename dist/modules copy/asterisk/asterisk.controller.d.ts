import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AriService } from './asterisk.service';
import { AriGateway } from './asterick.gateway';
import { CallDto } from './DTO/call.dto';
import { CallEventsService } from './events/CallEventsService';
export declare class AriController {
    private readonly ariService;
    private readonly ariGateway;
    private readonly callEventsService;
    constructor(ariService: AriService, ariGateway: AriGateway, callEventsService: CallEventsService);
    info(): Promise<any>;
    call(body: CallDto): Promise<any>;
    hangup(body: {
        channelId: string;
    }): Promise<{
        success: boolean;
        channelId: string;
    }>;
    events(extension: string): Observable<MessageEvent>;
}
