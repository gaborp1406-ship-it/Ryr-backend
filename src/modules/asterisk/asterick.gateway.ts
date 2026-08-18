import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { WebSocket } from 'ws';

import { AriService } from './asterisk.service';
import { AmdService } from '../amd/amd.service';

import {
  ARI_EVENTS,
  CALL_STATUS,
  CallStatus,
} from './constants/asterisk.constants';

import { CallEventsService } from './events/CallEventsService';

interface ICallContext {
  extension: string;
  phone: string;

  agentChannelId: string;
  customerChannelId?: string;

  bridgeId?: string;

  idRegistroLlamada?: number;

  status: CallStatus;
  endingReason?: string;
}

@Injectable()
export class AriGateway implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AriGateway.name);

  private ws!: WebSocket;
  private isConnecting = false;
  private reconnectTimer?: NodeJS.Timeout;
  private closingForShutdown = false;
  private amdInProgress = new Set<string>();
  private heartbeatInterval?: NodeJS.Timeout;
  private isAlive = true;
  private agentRingingChannels = new Set<string>();
  private outboundRingingChannels = new Set<string>();
  private connectedChannels = new Set<string>();
  private readonly destroyedChannels = new Set<string>();
  private readonly calls = new Map<string, ICallContext>();
  private readonly channelIndex = new Map<string, string>();
  private readonly pendingBridges = new Map<string, string>();

  constructor(
    private readonly ariService: AriService,
    private readonly amdService: AmdService,
    private readonly callEventsService: CallEventsService,
  ) { }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.closingForShutdown = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.removeAllListeners();
      try {
        this.ws.close();
      } catch {
        // noop
      }
    }
  }

  private connect() {
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;

    const connectWatchdog = setTimeout(() => {
      if (this.isConnecting) {
        this.logger.error('Timeout conectando WS ARI, forzando reset de estado');
        this.isConnecting = false;
        try {
          this.ws?.terminate();
        } catch { }
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    }, 10000);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.removeAllListeners();
      try {
        this.ws.terminate();
      } catch { }
    }


    const url =
      `ws://${process.env.ARI_HOST}:` +
      `${process.env.ARI_PORT}` +
      `/ari/events` +
      `?app=${process.env.ARI_APP}` +
      `&api_key=${process.env.ARI_USERNAME}:` +
      `${process.env.ARI_PASSWORD}`;
    this.logger.log(`🔗 URL WebSocket que se construye: ${url}`);
    this.logger.log(`   Host: ${process.env.ARI_HOST}`);
    this.logger.log(`   Port: ${process.env.ARI_PORT}`);
    this.logger.log(`   App: ${process.env.ARI_APP}`);
    this.logger.log(`   Username: ${process.env.ARI_USERNAME}`);
    this.logger.log('Conectando ARI...');

    this.logger.log('Conectando ARI...');

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.isConnecting = false;
      this.logger.log('ARI conectado');
      this.startHeartbeat();
    });

    this.ws.on('message', (data: any) => {
      try {
        const event = JSON.parse(data.toString());
        this.handleEvent(event);
      } catch (error) {
        this.logger.error('Error parseando evento ARI', error as any);
      }
    });
    this.ws.on('pong', () => {
      this.isAlive = true;
    });

    this.ws.on('close', (code, reason) => {
      clearTimeout(connectWatchdog);
      this.isConnecting = false;
      this.stopHeartbeat();

      this.logger.warn(`ARI WS cerrado. code=${code} reason=${reason?.toString()}`);

      if (this.closingForShutdown) return;

      this.logger.warn('ARI desconectado, reintentando en 3s...');
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    });

    this.ws.on('error', (error) => {
      clearTimeout(connectWatchdog);
      this.isConnecting = false;
      this.logger.error('Error WebSocket ARI', error as any);
      if (!this.closingForShutdown && !this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.isAlive = true;

    this.heartbeatInterval = setInterval(() => {
      if (!this.isAlive) {
        this.logger.warn('ARI no respondió al ping, forzando reconexión');
        this.ws.terminate(); // dispara 'close' -> reconecta
        return;
      }
      this.isAlive = false;
      try {
        this.ws.ping();
      } catch {
        // noop
      }
    }, 30000); // cada 30s
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }
  registerCall(
    context: Pick<ICallContext, 'extension' | 'phone' | 'agentChannelId'>,
  ): void {
    const call: ICallContext = {
      ...context,
      status: CALL_STATUS.DIALING,
    };

    this.calls.set(call.agentChannelId, call);
    this.linkChannel(call.agentChannelId, call.agentChannelId);

    this.logger.log(`Llamada registrada: ${context.agentChannelId}`);
  }

  removeCall(agentChannelId: string): void {
    const call = this.calls.get(agentChannelId);
    if (!call) return;

    this.channelIndex.delete(agentChannelId);
    if (call.customerChannelId) {
      this.channelIndex.delete(call.customerChannelId);
    }
    this.calls.delete(agentChannelId);
  }

  updateCall(channelId: string, data: Partial<ICallContext>): void {
    const call = this.calls.get(channelId);

    if (!call) {
      this.logger.warn(`No existe llamada para actualizar: ${channelId}`);
      return;
    }

    const updated = { ...call, ...data };
    this.calls.set(channelId, updated);

    if (data.customerChannelId) {
      this.linkChannel(channelId, data.customerChannelId);
    }
  }

  private linkChannel(agentChannelId: string, channelId: string): void {
    this.channelIndex.set(channelId, agentChannelId);
  }

  findCallByChannel(channelId: string): ICallContext | undefined {
    const key = this.channelIndex.get(channelId);
    return key ? this.calls.get(key) : undefined;
  }

  async handleEvent(event: any): Promise<void> {
    this.logger.debug(`EVENTO ARI: ${event.type}`);

    switch (event.type) {
      case ARI_EVENTS.STASIS_START:
        await this.onStasisStart(event);
        break;

      case ARI_EVENTS.STASIS_END:
        await this.onStasisEnd(event);
        break;

      case ARI_EVENTS.CHANNEL_STATE_CHANGE:
        await this.onChannelStateChange(event);
        break;

      case ARI_EVENTS.DIAL:
        await this.onDial(event);
        break;

      case ARI_EVENTS.CHANNEL_DESTROYED:
        await this.onChannelDestroyed(event);
        break;

      case ARI_EVENTS.CHANNEL_HANGUP_REQUEST:
        await this.onChannelHangupRequest(event);
        break;
    }
  }

  private async onStasisStart(event: any): Promise<void> {
    const channel = event.channel;
    const args: string[] = event.args || [];

    if (!channel?.id) {
      return;
    }

    this.logger.log(`🔍 [onStasisStart] args: ${JSON.stringify(args)}`);
    if (args[0] === 'outbound') {
      await this.handleAgentStasisStart(channel, args);
      return;
    }

    if (args[0] === 'bridge') {
      await this.handleCustomerStasisStart(channel, args);
      return;
    }

    this.logger.warn(
      `StasisStart no reconocido para canal ${channel.id} ` +
      `(args=${JSON.stringify(args)}), colgando canal huérfano`,
    );

    if (!this.destroyedChannels.has(channel.id)) {
      try {
        await this.ariService.hangup(channel.id);
      } catch (error) {
        this.logger.warn(`No se pudo colgar canal huérfano ${channel.id}`);
      }
    }
  }

  private async handleAgentStasisStart(
    channel: any,
    args: string[],
  ): Promise<void> {
    const phone = args[1];

    this.logger.log(
      `🔍 [handleAgentStasisStart] Canal: ${channel.id}, Phone: ${phone}`,
    );

    const call = this.findCallByChannel(channel.id);

    if (!call) {
      this.logger.warn(
        `No existe contexto para canal de asesor ${channel.id}, colgando`,
      );

      if (!this.destroyedChannels.has(channel.id)) {
        try {
          await this.ariService.hangup(channel.id);
        } catch { }
      }
      return;
    }

    if (
      call.status === CALL_STATUS.ENDING ||
      call.status === CALL_STATUS.ENDED
    ) {
      return;
    }

    this.callEventsService.ringingAgent({
      extension: call.extension,
      channelId: channel.id,
    });

    await this.ariService.answer(channel.id);
    call.status = CALL_STATUS.AGENT_ANSWERED;

    if (this.destroyedChannels.has(channel.id)) {
      await this.endCall(call, 'agent-hangup-on-answer');
      return;
    }

    const bridge = await this.ariService.createBridge();
    call.bridgeId = bridge.id;

    await this.ariService.addChannelToBridge(bridge.id, channel.id);

    let customerChannel: any;

    try {
      customerChannel = await this.ariService.originate(
        `PJSIP/${phone}@itelbox-out`,
        `bridge,${bridge.id}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Fallo al originar canal de cliente para ${phone}: ` +
        `status=${error?.response?.status} ` +
        `data=${JSON.stringify(error?.response?.data)}`,
      );

      await this.endCall(call, 'originate-failed');
      return;
    }

    call.customerChannelId = customerChannel.id;
    call.status = CALL_STATUS.DIALING_CUSTOMER;
    this.linkChannel(call.agentChannelId, customerChannel.id);

    this.pendingBridges.set(customerChannel.id, bridge.id);

    this.logger.log(
      `Cliente originado: ${customerChannel.id} -> PJSIP/${phone}@itelbox-out`,
    );
  }

  private async handleCustomerStasisStart(
    channel: any,
    args: string[],
  ): Promise<void> {
    const bridgeId = args[1];

    if (this.destroyedChannels.has(channel.id)) {
      this.logger.warn(`Canal ${channel.id} ya fue destruido antes de AMD`);
      return;
    }

    const call = this.findCallByChannel(channel.id);

    if (
      call &&
      (call.status === CALL_STATUS.ENDING || call.status === CALL_STATUS.ENDED)
    ) {
      return;
    }

    await this.ariService.answer(channel.id);

    if (call) {
      call.status = CALL_STATUS.AMD_CHECKING;
    }

    try {
      this.amdInProgress.add(channel.id);
      const amdResult = await this.amdService.detectHuman(channel.id, 3000);
      this.amdInProgress.delete(channel.id);
      if (this.destroyedChannels.has(channel.id)) {
        this.logger.warn(`Canal ${channel.id} fue destruido durante AMD`);
        return;
      }

      if (amdResult.isHuman) {
        this.logger.log('HUMANO detectado - agregando a bridge');

        if (this.destroyedChannels.has(channel.id)) {
          return;
        }

        await this.safeAddToBridge(bridgeId, channel.id);

        if (call) {
          call.status = CALL_STATUS.CONNECTED;

          // Recién acá: humano confirmado por AMD Y canal todavía vivo.
          this.callEventsService.callConnected({
            extension: call.extension,
            channelId: channel.id,
            phone: call.phone,
            bridgeId: call.bridgeId,
          });
        }
      } else {
        this.logger.log('MAQUINA detectada - desconectando');

        if (!this.destroyedChannels.has(channel.id)) {
          await this.ariService.hangup(channel.id);
        }
      }
    } catch (error) {
      if (this.destroyedChannels.has(channel.id)) {
        this.logger.warn(
          `Canal ${channel.id} terminó durante el procesamiento de AMD`,
        );
        return;
      }

      this.logger.error(
        'Error durante AMD, agregando al bridge igual',
        error as any,
      );

      await this.safeAddToBridge(bridgeId, channel.id);

      if (call) {
        call.status = CALL_STATUS.CONNECTED;
        this.callEventsService.callConnected({
          extension: call.extension,
          channelId: channel.id,
          phone: call.phone,
          bridgeId: call.bridgeId,
        });
      }


    }
  }

  private async safeAddToBridge(
    bridgeId: string,
    channelId: string,
  ): Promise<void> {
    try {
      await this.ariService.addChannelToBridge(bridgeId, channelId);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        this.logger.warn(
          `Canal ${channelId} o bridge ${bridgeId} ya no existen al unirlos`,
        );
        return;
      }
      throw error;
    }
  }

  private async onChannelHangupRequest(event: any): Promise<void> {
    const channelId = event.channel?.id;
    if (!channelId) return;

    this.logger.log(`🚪 Hangup request recibido: ${channelId}`);
    this.destroyedChannels.add(channelId);

    if (this.amdInProgress.has(channelId)) {
      this.amdInProgress.delete(channelId);
    }

    const call = this.findCallByChannel(channelId);

    if (call) {
      await this.endCall(
        call,
        channelId === call.agentChannelId ? 'agent-hangup' : 'customer-hangup',
      );
      return;
    }

    try {
      await this.ariService.hangup(channelId);
    } catch (error) {
      this.logger.warn(`No se pudo colgar canal huérfano ${channelId}`);
    }
  }





  private async onStasisEnd(event: any): Promise<void> {
    const channelId = event.channel?.id;
    if (!channelId) return;

    this.logger.log(`Canal salió de Stasis: ${channelId}`);
  }

  private async onChannelStateChange(event: any): Promise<void> {
    const channel = event.channel;
    if (!channel?.id) return;

    const call = this.findCallByChannel(channel.id);
    if (!call) return;

    if (channel.id === call.agentChannelId && channel.state === 'Ringing') {
      if (this.agentRingingChannels.has(channel.id)) {
        return;
      }

      this.agentRingingChannels.add(channel.id);

      this.callEventsService.ringingAgent({
        extension: call.extension,
        channelId: channel.id,
      });
    }
  }
  private async onDial(event: any): Promise<void> {
    const peer = event.peer;
    const dialStatus = event.dialstatus;
    const channelId = peer?.id;

    if (!channelId || !dialStatus) return;

    const call = this.findCallByChannel(channelId);
    if (!call) return;

    if (channelId !== call.customerChannelId) {
      return;
    }

    // 👇 AGREGAR ESTO: si la llamada ya está terminando/terminada,
    // ignoramos cualquier evento de Dial tardío (RINGING, ANSWER, etc.)
    if (
      call.status === CALL_STATUS.ENDING ||
      call.status === CALL_STATUS.ENDED
    ) {
      this.logger.log(
        `Dial ignorado (${dialStatus}) para ${channelId}: llamada ya en estado ${call.status}`,
      );
      return;
    }

    this.logger.log(
      `DIAL cliente ${channelId} (${call.phone}): ${dialStatus}` +
      (event.dialstring ? ` dialstring=${event.dialstring}` : ''),
    );

    if (dialStatus === 'RINGING' || dialStatus === 'PROGRESS') {
      if (this.outboundRingingChannels.has(channelId)) return;
      this.outboundRingingChannels.add(channelId);

      this.callEventsService.ringingOutbound({
        extension: call.extension,
        channelId,
        phone: call.phone,
      });
      return;
    }

    if (dialStatus === 'ANSWER') {
      // Esto es solo la respuesta SIP cruda (200 OK). Puede ser humano,
      // contestadora, o alguien que corta al toque. NO se emite call-connected
      // acá: se emite en handleCustomerStasisStart, solo si el AMD confirma
      // humano y el canal sigue vivo.
      if (this.connectedChannels.has(channelId)) return;
      this.connectedChannels.add(channelId);
      return;
    }

    if (
      dialStatus === 'NOANSWER' ||
      dialStatus === 'BUSY' ||
      dialStatus === 'CANCEL' ||
      dialStatus === 'CONGESTION' ||
      dialStatus === 'CHANUNAVAIL'
    ) {
      this.callEventsService.noAnswer({
        extension: call.extension,
        channelId,
      });

      await this.endCall(call, `dial-${dialStatus.toLowerCase()}`);
      return;
    }
  }

  private async onChannelDestroyed(event: any): Promise<void> {
    const channelId = event.channel?.id;
    if (!channelId) return;

    this.destroyedChannels.add(channelId);

    const call = this.findCallByChannel(channelId);
    if (!call) return;

    const isAgentChannel = channelId === call.agentChannelId;
    const isCustomerChannel = channelId === call.customerChannelId;

    const causeInfo =
      event.cause !== undefined
        ? ` cause=${event.cause}(${event.cause_txt || 'sin descripción'})`
        : '';

    this.logger.log(
      `ChannelDestroyed: ${channelId} | agent=${isAgentChannel} | customer=${isCustomerChannel}${causeInfo}`,
    );

    if (isCustomerChannel && call.status === CALL_STATUS.DIALING_CUSTOMER) {
      this.logger.warn(
        `Cliente ${channelId} (${call.phone}) se destruyó SIN llegar a contestar` +
        causeInfo,
      );
    }

    await this.endCall(
      call,
      isAgentChannel ? 'agent-destroyed' : 'customer-destroyed',
    );
  }

  private async endCall(call: ICallContext, reason: string): Promise<void> {
    if (
      call.status === CALL_STATUS.ENDING ||
      call.status === CALL_STATUS.ENDED
    ) {
      return;
    }

    call.status = CALL_STATUS.ENDING;
    call.endingReason = reason;

    this.logger.log(
      `Finalizando llamada ${call.agentChannelId} (motivo: ${reason})`,
    );

    const hangupIfAlive = async (channelId?: string) => {
      if (!channelId) return;
      if (this.destroyedChannels.has(channelId)) return;

      try {
        await this.ariService.hangup(channelId);
        this.logger.log(`Canal colgado: ${channelId}`);
      } catch (error: any) {
        this.logger.warn(`No se pudo colgar canal ${channelId}`);
      }
    };

    await Promise.all([
      hangupIfAlive(call.agentChannelId),
      hangupIfAlive(call.customerChannelId),
    ]);

    if (call.bridgeId) {
      try {
        await this.ariService.deleteBridge(call.bridgeId);
        this.logger.log(`Bridge eliminado: ${call.bridgeId}`);
      } catch (error: any) {
        this.logger.warn(`No se pudo eliminar bridge ${call.bridgeId}`);
      }
    }

    this.callEventsService.callEnded({
      extension: call.extension,
      channelId: call.agentChannelId,
      reason,
    });

    this.cleanupCall(call);

    call.status = CALL_STATUS.ENDED;
  }

  private cleanupCall(call: ICallContext): void {
    this.agentRingingChannels.delete(call.agentChannelId);
    this.channelIndex.delete(call.agentChannelId);
    this.destroyedChannels.delete(call.agentChannelId); // 👈 agregar

    if (call.customerChannelId) {
      this.outboundRingingChannels.delete(call.customerChannelId);
      this.connectedChannels.delete(call.customerChannelId);
      this.pendingBridges.delete(call.customerChannelId);
      this.channelIndex.delete(call.customerChannelId);
      this.destroyedChannels.delete(call.customerChannelId); // 👈 agregar
    }

    this.calls.delete(call.agentChannelId);
  }

  // ==========================================================
  // API pública usada por el controller
  // ==========================================================

  async hangupCall(channelId: string) {
    const call = this.findCallByChannel(channelId);

    if (!call) {
      this.logger.warn(`No se encontró llamada para hangup: ${channelId}`);

      try {
        await this.ariService.hangup(channelId);
      } catch {
        this.logger.warn(`No se pudo colgar canal ${channelId}`);
      }

      return { success: true, channelId };
    }

    this.logger.log(
      `Colgando llamada completa: ${call.agentChannelId} -> ${call.customerChannelId}`,
    );

    await this.endCall(call, 'manual-hangup');

    return { success: true, channelId };
  }
}
