"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AriGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriGateway = void 0;
const common_1 = require("@nestjs/common");
const ws_1 = require("ws");
const asterisk_service_1 = require("./asterisk.service");
const amd_service_1 = require("../amd/amd.service");
const asterisk_constants_1 = require("./constants/asterisk.constants");
const CallEventsService_1 = require("./events/CallEventsService");
let AriGateway = AriGateway_1 = class AriGateway {
    ariService;
    amdService;
    callEventsService;
    logger = new common_1.Logger(AriGateway_1.name);
    ws;
    isConnecting = false;
    reconnectTimer;
    closingForShutdown = false;
    amdInProgress = new Set();
    heartbeatInterval;
    isAlive = true;
    agentRingingChannels = new Set();
    outboundRingingChannels = new Set();
    connectedChannels = new Set();
    destroyedChannels = new Set();
    calls = new Map();
    channelIndex = new Map();
    pendingBridges = new Map();
    constructor(ariService, amdService, callEventsService) {
        this.ariService = ariService;
        this.amdService = amdService;
        this.callEventsService = callEventsService;
    }
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
            }
            catch {
            }
        }
    }
    connect() {
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
                }
                catch { }
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
            }
            catch { }
        }
        const url = `ws://${process.env.ARI_HOST}:` +
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
        this.ws = new ws_1.WebSocket(url);
        this.ws.on('open', () => {
            this.isConnecting = false;
            this.logger.log('ARI conectado');
            this.startHeartbeat();
        });
        this.ws.on('message', (data) => {
            try {
                const event = JSON.parse(data.toString());
                this.handleEvent(event);
            }
            catch (error) {
                this.logger.error('Error parseando evento ARI', error);
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
            if (this.closingForShutdown)
                return;
            this.logger.warn('ARI desconectado, reintentando en 3s...');
            this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        });
        this.ws.on('error', (error) => {
            clearTimeout(connectWatchdog);
            this.isConnecting = false;
            this.logger.error('Error WebSocket ARI', error);
            if (!this.closingForShutdown && !this.reconnectTimer) {
                this.reconnectTimer = setTimeout(() => this.connect(), 3000);
            }
        });
    }
    startHeartbeat() {
        this.stopHeartbeat();
        this.isAlive = true;
        this.heartbeatInterval = setInterval(() => {
            if (!this.isAlive) {
                this.logger.warn('ARI no respondió al ping, forzando reconexión');
                this.ws.terminate();
                return;
            }
            this.isAlive = false;
            try {
                this.ws.ping();
            }
            catch {
            }
        }, 30000);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }
    registerCall(context) {
        const call = {
            ...context,
            status: asterisk_constants_1.CALL_STATUS.DIALING,
        };
        this.calls.set(call.agentChannelId, call);
        this.linkChannel(call.agentChannelId, call.agentChannelId);
        this.logger.log(`Llamada registrada: ${context.agentChannelId}`);
    }
    removeCall(agentChannelId) {
        const call = this.calls.get(agentChannelId);
        if (!call)
            return;
        this.channelIndex.delete(agentChannelId);
        if (call.customerChannelId) {
            this.channelIndex.delete(call.customerChannelId);
        }
        this.calls.delete(agentChannelId);
    }
    updateCall(channelId, data) {
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
    linkChannel(agentChannelId, channelId) {
        this.channelIndex.set(channelId, agentChannelId);
    }
    findCallByChannel(channelId) {
        const key = this.channelIndex.get(channelId);
        return key ? this.calls.get(key) : undefined;
    }
    async handleEvent(event) {
        this.logger.debug(`EVENTO ARI: ${event.type}`);
        switch (event.type) {
            case asterisk_constants_1.ARI_EVENTS.STASIS_START:
                await this.onStasisStart(event);
                break;
            case asterisk_constants_1.ARI_EVENTS.STASIS_END:
                await this.onStasisEnd(event);
                break;
            case asterisk_constants_1.ARI_EVENTS.CHANNEL_STATE_CHANGE:
                await this.onChannelStateChange(event);
                break;
            case asterisk_constants_1.ARI_EVENTS.DIAL:
                await this.onDial(event);
                break;
            case asterisk_constants_1.ARI_EVENTS.CHANNEL_DESTROYED:
                await this.onChannelDestroyed(event);
                break;
            case asterisk_constants_1.ARI_EVENTS.CHANNEL_HANGUP_REQUEST:
                await this.onChannelHangupRequest(event);
                break;
        }
    }
    async onStasisStart(event) {
        const channel = event.channel;
        const args = event.args || [];
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
        this.logger.warn(`StasisStart no reconocido para canal ${channel.id} ` +
            `(args=${JSON.stringify(args)}), colgando canal huérfano`);
        if (!this.destroyedChannels.has(channel.id)) {
            try {
                await this.ariService.hangup(channel.id);
            }
            catch (error) {
                this.logger.warn(`No se pudo colgar canal huérfano ${channel.id}`);
            }
        }
    }
    async handleAgentStasisStart(channel, args) {
        const phone = args[1];
        this.logger.log(`🔍 [handleAgentStasisStart] Canal: ${channel.id}, Phone: ${phone}`);
        const call = this.findCallByChannel(channel.id);
        if (!call) {
            this.logger.warn(`No existe contexto para canal de asesor ${channel.id}, colgando`);
            if (!this.destroyedChannels.has(channel.id)) {
                try {
                    await this.ariService.hangup(channel.id);
                }
                catch { }
            }
            return;
        }
        if (call.status === asterisk_constants_1.CALL_STATUS.ENDING ||
            call.status === asterisk_constants_1.CALL_STATUS.ENDED) {
            return;
        }
        this.callEventsService.ringingAgent({
            extension: call.extension,
            channelId: channel.id,
        });
        await this.ariService.answer(channel.id);
        call.status = asterisk_constants_1.CALL_STATUS.AGENT_ANSWERED;
        if (this.destroyedChannels.has(channel.id)) {
            await this.endCall(call, 'agent-hangup-on-answer');
            return;
        }
        const bridge = await this.ariService.createBridge();
        call.bridgeId = bridge.id;
        await this.ariService.addChannelToBridge(bridge.id, channel.id);
        let customerChannel;
        try {
            customerChannel = await this.ariService.originate(`PJSIP/${phone}@itelbox-out`, `bridge,${bridge.id}`);
        }
        catch (error) {
            this.logger.error(`Fallo al originar canal de cliente para ${phone}: ` +
                `status=${error?.response?.status} ` +
                `data=${JSON.stringify(error?.response?.data)}`);
            await this.endCall(call, 'originate-failed');
            return;
        }
        call.customerChannelId = customerChannel.id;
        call.status = asterisk_constants_1.CALL_STATUS.DIALING_CUSTOMER;
        this.linkChannel(call.agentChannelId, customerChannel.id);
        this.pendingBridges.set(customerChannel.id, bridge.id);
        this.logger.log(`Cliente originado: ${customerChannel.id} -> PJSIP/${phone}@itelbox-out`);
    }
    async handleCustomerStasisStart(channel, args) {
        const bridgeId = args[1];
        if (this.destroyedChannels.has(channel.id)) {
            this.logger.warn(`Canal ${channel.id} ya fue destruido antes de AMD`);
            return;
        }
        const call = this.findCallByChannel(channel.id);
        if (call &&
            (call.status === asterisk_constants_1.CALL_STATUS.ENDING || call.status === asterisk_constants_1.CALL_STATUS.ENDED)) {
            return;
        }
        await this.ariService.answer(channel.id);
        if (call) {
            call.status = asterisk_constants_1.CALL_STATUS.AMD_CHECKING;
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
                    call.status = asterisk_constants_1.CALL_STATUS.CONNECTED;
                    this.callEventsService.callConnected({
                        extension: call.extension,
                        channelId: channel.id,
                        phone: call.phone,
                        bridgeId: call.bridgeId,
                    });
                }
            }
            else {
                this.logger.log('MAQUINA detectada - desconectando');
                if (!this.destroyedChannels.has(channel.id)) {
                    await this.ariService.hangup(channel.id);
                }
            }
        }
        catch (error) {
            if (this.destroyedChannels.has(channel.id)) {
                this.logger.warn(`Canal ${channel.id} terminó durante el procesamiento de AMD`);
                return;
            }
            this.logger.error('Error durante AMD, agregando al bridge igual', error);
            await this.safeAddToBridge(bridgeId, channel.id);
            if (call) {
                call.status = asterisk_constants_1.CALL_STATUS.CONNECTED;
                this.callEventsService.callConnected({
                    extension: call.extension,
                    channelId: channel.id,
                    phone: call.phone,
                    bridgeId: call.bridgeId,
                });
            }
        }
    }
    async safeAddToBridge(bridgeId, channelId) {
        try {
            await this.ariService.addChannelToBridge(bridgeId, channelId);
        }
        catch (error) {
            if (error?.response?.status === 404) {
                this.logger.warn(`Canal ${channelId} o bridge ${bridgeId} ya no existen al unirlos`);
                return;
            }
            throw error;
        }
    }
    async onChannelHangupRequest(event) {
        const channelId = event.channel?.id;
        if (!channelId)
            return;
        this.logger.log(`🚪 Hangup request recibido: ${channelId}`);
        this.destroyedChannels.add(channelId);
        if (this.amdInProgress.has(channelId)) {
            this.amdInProgress.delete(channelId);
        }
        const call = this.findCallByChannel(channelId);
        if (call) {
            await this.endCall(call, channelId === call.agentChannelId ? 'agent-hangup' : 'customer-hangup');
            return;
        }
        try {
            await this.ariService.hangup(channelId);
        }
        catch (error) {
            this.logger.warn(`No se pudo colgar canal huérfano ${channelId}`);
        }
    }
    async onStasisEnd(event) {
        const channelId = event.channel?.id;
        if (!channelId)
            return;
        this.logger.log(`Canal salió de Stasis: ${channelId}`);
    }
    async onChannelStateChange(event) {
        const channel = event.channel;
        if (!channel?.id)
            return;
        const call = this.findCallByChannel(channel.id);
        if (!call)
            return;
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
    async onDial(event) {
        const peer = event.peer;
        const dialStatus = event.dialstatus;
        const channelId = peer?.id;
        if (!channelId || !dialStatus)
            return;
        const call = this.findCallByChannel(channelId);
        if (!call)
            return;
        if (channelId !== call.customerChannelId) {
            return;
        }
        if (call.status === asterisk_constants_1.CALL_STATUS.ENDING ||
            call.status === asterisk_constants_1.CALL_STATUS.ENDED) {
            this.logger.log(`Dial ignorado (${dialStatus}) para ${channelId}: llamada ya en estado ${call.status}`);
            return;
        }
        this.logger.log(`DIAL cliente ${channelId} (${call.phone}): ${dialStatus}` +
            (event.dialstring ? ` dialstring=${event.dialstring}` : ''));
        if (dialStatus === 'RINGING' || dialStatus === 'PROGRESS') {
            if (this.outboundRingingChannels.has(channelId))
                return;
            this.outboundRingingChannels.add(channelId);
            this.callEventsService.ringingOutbound({
                extension: call.extension,
                channelId,
                phone: call.phone,
            });
            return;
        }
        if (dialStatus === 'ANSWER') {
            if (this.connectedChannels.has(channelId))
                return;
            this.connectedChannels.add(channelId);
            return;
        }
        if (dialStatus === 'NOANSWER' ||
            dialStatus === 'BUSY' ||
            dialStatus === 'CANCEL' ||
            dialStatus === 'CONGESTION' ||
            dialStatus === 'CHANUNAVAIL') {
            this.callEventsService.noAnswer({
                extension: call.extension,
                channelId,
            });
            await this.endCall(call, `dial-${dialStatus.toLowerCase()}`);
            return;
        }
    }
    async onChannelDestroyed(event) {
        const channelId = event.channel?.id;
        if (!channelId)
            return;
        this.destroyedChannels.add(channelId);
        const call = this.findCallByChannel(channelId);
        if (!call)
            return;
        const isAgentChannel = channelId === call.agentChannelId;
        const isCustomerChannel = channelId === call.customerChannelId;
        const causeInfo = event.cause !== undefined
            ? ` cause=${event.cause}(${event.cause_txt || 'sin descripción'})`
            : '';
        this.logger.log(`ChannelDestroyed: ${channelId} | agent=${isAgentChannel} | customer=${isCustomerChannel}${causeInfo}`);
        if (isCustomerChannel && call.status === asterisk_constants_1.CALL_STATUS.DIALING_CUSTOMER) {
            this.logger.warn(`Cliente ${channelId} (${call.phone}) se destruyó SIN llegar a contestar` +
                causeInfo);
        }
        await this.endCall(call, isAgentChannel ? 'agent-destroyed' : 'customer-destroyed');
    }
    async endCall(call, reason) {
        if (call.status === asterisk_constants_1.CALL_STATUS.ENDING ||
            call.status === asterisk_constants_1.CALL_STATUS.ENDED) {
            return;
        }
        call.status = asterisk_constants_1.CALL_STATUS.ENDING;
        call.endingReason = reason;
        this.logger.log(`Finalizando llamada ${call.agentChannelId} (motivo: ${reason})`);
        const hangupIfAlive = async (channelId) => {
            if (!channelId)
                return;
            if (this.destroyedChannels.has(channelId))
                return;
            try {
                await this.ariService.hangup(channelId);
                this.logger.log(`Canal colgado: ${channelId}`);
            }
            catch (error) {
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
            }
            catch (error) {
                this.logger.warn(`No se pudo eliminar bridge ${call.bridgeId}`);
            }
        }
        this.callEventsService.callEnded({
            extension: call.extension,
            channelId: call.agentChannelId,
            reason,
        });
        this.cleanupCall(call);
        call.status = asterisk_constants_1.CALL_STATUS.ENDED;
    }
    cleanupCall(call) {
        this.agentRingingChannels.delete(call.agentChannelId);
        this.channelIndex.delete(call.agentChannelId);
        this.destroyedChannels.delete(call.agentChannelId);
        if (call.customerChannelId) {
            this.outboundRingingChannels.delete(call.customerChannelId);
            this.connectedChannels.delete(call.customerChannelId);
            this.pendingBridges.delete(call.customerChannelId);
            this.channelIndex.delete(call.customerChannelId);
            this.destroyedChannels.delete(call.customerChannelId);
        }
        this.calls.delete(call.agentChannelId);
    }
    async hangupCall(channelId) {
        const call = this.findCallByChannel(channelId);
        if (!call) {
            this.logger.warn(`No se encontró llamada para hangup: ${channelId}`);
            try {
                await this.ariService.hangup(channelId);
            }
            catch {
                this.logger.warn(`No se pudo colgar canal ${channelId}`);
            }
            return { success: true, channelId };
        }
        this.logger.log(`Colgando llamada completa: ${call.agentChannelId} -> ${call.customerChannelId}`);
        await this.endCall(call, 'manual-hangup');
        return { success: true, channelId };
    }
};
exports.AriGateway = AriGateway;
exports.AriGateway = AriGateway = AriGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [asterisk_service_1.AriService,
        amd_service_1.AmdService,
        CallEventsService_1.CallEventsService])
], AriGateway);
//# sourceMappingURL=asterick.gateway.js.map