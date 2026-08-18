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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const asterisk_service_1 = require("./asterisk.service");
const asterick_gateway_1 = require("./asterick.gateway");
const call_dto_1 = require("./DTO/call.dto");
const CallEventsService_1 = require("./events/CallEventsService");
let AriController = class AriController {
    ariService;
    ariGateway;
    callEventsService;
    constructor(ariService, ariGateway, callEventsService) {
        this.ariService = ariService;
        this.ariGateway = ariGateway;
        this.callEventsService = callEventsService;
    }
    async info() {
        return this.ariService.getInfo();
    }
    async call(body) {
        const channelId = (0, uuid_1.v4)();
        this.ariGateway.registerCall({
            extension: body.agent,
            phone: body.phone,
            agentChannelId: channelId,
        });
        try {
            const result = await this.ariService.call(body.agent, body.phone, body.idTrabajador, channelId);
            this.ariGateway.updateCall(channelId, {
                phone: result.phone,
                idRegistroLlamada: result.idRegistroLlamada,
            });
            return {
                ...result,
                channelId,
            };
        }
        catch (error) {
            this.ariGateway.removeCall(channelId);
            throw error;
        }
    }
    async hangup(body) {
        return this.ariGateway.hangupCall(body.channelId);
    }
    events(extension) {
        return this.callEventsService
            .subscribe(extension)
            .pipe((0, rxjs_1.map)((event) => ({
            data: event,
        })));
    }
};
exports.AriController = AriController;
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AriController.prototype, "info", null);
__decorate([
    (0, common_1.Post)('call'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [call_dto_1.CallDto]),
    __metadata("design:returntype", Promise)
], AriController.prototype, "call", null);
__decorate([
    (0, common_1.Post)('hangup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AriController.prototype, "hangup", null);
__decorate([
    (0, common_1.Sse)('events/:extension'),
    __param(0, (0, common_1.Param)('extension')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], AriController.prototype, "events", null);
exports.AriController = AriController = __decorate([
    (0, common_1.Controller)('ari'),
    __metadata("design:paramtypes", [asterisk_service_1.AriService,
        asterick_gateway_1.AriGateway,
        CallEventsService_1.CallEventsService])
], AriController);
//# sourceMappingURL=asterisk.controller.js.map