import { Observable } from 'rxjs';
import { CallEvent } from '../interfaces/events.interface';
export declare class CallEventsService {
    private readonly logger;
    private readonly events$;
    emit(event: CallEvent): void;
    subscribe(extension: string): Observable<CallEvent>;
    ringingAgent(data: {
        extension: string;
        channelId: string;
    }): void;
    ringingOutbound(data: {
        extension: string;
        channelId: string;
        phone: string;
    }): void;
    callConnected(data: {
        extension: string;
        channelId: string;
        phone?: string;
        bridgeId?: string;
    }): void;
    callEnded(data: {
        extension: string;
        channelId?: string;
        reason?: string;
    }): void;
    noAnswer(data: {
        extension: string;
        channelId?: string;
    }): void;
}
