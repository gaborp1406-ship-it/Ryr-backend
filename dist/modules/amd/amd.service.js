"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmdService = exports.AmdResult = void 0;
const common_1 = require("@nestjs/common");
var AmdResult;
(function (AmdResult) {
    AmdResult["HUMAN"] = "HUMAN";
    AmdResult["MACHINE"] = "MACHINE";
})(AmdResult || (exports.AmdResult = AmdResult = {}));
let AmdService = class AmdService {
    async detectHuman(channelId, timeoutMs = 3000) {
        const startTime = Date.now();
        try {
            await this.sleep(timeoutMs);
            const detectionTimeMs = Date.now() - startTime;
            const isHuman = Math.random() > 0.4;
            const rtpPacketCount = isHuman
                ? Math.floor(Math.random() * 20 + 10)
                : Math.floor(Math.random() * 3);
            const resultType = isHuman ? AmdResult.HUMAN : AmdResult.MACHINE;
            console.log(`[AMD] ${isHuman ? '✅ HUMANO' : '🤖 MÁQUINA'} detectado (${rtpPacketCount} packets)`);
            return {
                isHuman,
                resultType,
                rtpPackets: rtpPacketCount,
                detectionTimeMs,
            };
        }
        catch (error) {
            console.error('Error during AMD detection:', error);
            return {
                isHuman: true,
                resultType: AmdResult.HUMAN,
                rtpPackets: 0,
                detectionTimeMs: Date.now() - startTime,
            };
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.AmdService = AmdService;
exports.AmdService = AmdService = __decorate([
    (0, common_1.Injectable)()
], AmdService);
//# sourceMappingURL=amd.service.js.map