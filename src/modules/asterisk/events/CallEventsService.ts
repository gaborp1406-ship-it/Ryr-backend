import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CALL_EVENTS } from '../constants/asterisk.constants';

import { CallEvent } from '../interfaces/events.interface';

@Injectable()
export class CallEventsService {
  private readonly logger = new Logger(CallEventsService.name);

  private readonly events$ = new Subject<CallEvent>();

  emit(event: CallEvent): void {
    this.events$.next({
      ...event,
      timestamp: new Date().toISOString(),
    });
  }

  // Cada cliente SSE se suscribe filtrando por su extensión.
  // El Subject se completa solo al destruirse el módulo (ver onModuleDestroy
  // en el gateway); cada suscripción individual se limpia sola cuando el
  // cliente HTTP cierra la conexión (Nest se encarga del unsubscribe).
  subscribe(extension: string): Observable<CallEvent> {
    return this.events$
      .asObservable()
      .pipe(filter((event) => event.extension === extension));
  }

  ringingAgent(data: { extension: string; channelId: string }): void {
    this.emit({
      type: CALL_EVENTS.RINGING_AGENT,
      ...data,
    });
  }

  ringingOutbound(data: {
    extension: string;
    channelId: string;
    phone: string;
  }): void {
    this.emit({
      type: CALL_EVENTS.RINGING_OUTBOUND,
      ...data,
    });
  }

  callConnected(data: {
    extension: string;
    channelId: string;
    phone?: string;
    bridgeId?: string;
  }): void {
    this.emit({
      type: CALL_EVENTS.CALL_CONNECTED,
      ...data,
    });
  }

  callEnded(data: {
    extension: string;
    channelId?: string;
    reason?: string;
  }): void {
    this.emit({
      type: CALL_EVENTS.CALL_ENDED,
      ...data,
    });
  }

  noAnswer(data: { extension: string; channelId?: string }): void {
    this.emit({
      type: CALL_EVENTS.NO_ANSWER,
      ...data,
    });
  }
}
