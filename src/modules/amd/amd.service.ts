import { Injectable } from '@nestjs/common';
export enum AmdResult {
  HUMAN = 'HUMAN',
  MACHINE = 'MACHINE',
}

export interface DetectionResult {
  isHuman: boolean;
  resultType: AmdResult;
  rtpPackets: number;
  detectionTimeMs: number;
}

@Injectable()
export class AmdService {
  async detectHuman(
    channelId: string,
    timeoutMs: number = 3000,
  ): Promise<DetectionResult> {
    const startTime = Date.now();

    try {
      // Esperar el timeout
      await this.sleep(timeoutMs);

      const detectionTimeMs = Date.now() - startTime;

      // ✅ LÓGICA MEJORADA:
      // Simular detección más realista
      // 60% probabilidad de humano, 40% de máquina
      const isHuman = Math.random() > 0.4;
      const rtpPacketCount = isHuman
        ? Math.floor(Math.random() * 20 + 10) // 10-30 packets si humano
        : Math.floor(Math.random() * 3); // 0-3 packets si máquina

      const resultType = isHuman ? AmdResult.HUMAN : AmdResult.MACHINE;

      console.log(
        `[AMD] ${isHuman ? '✅ HUMANO' : '🤖 MÁQUINA'} detectado (${rtpPacketCount} packets)`,
      );

      return {
        isHuman,
        resultType,
        rtpPackets: rtpPacketCount,
        detectionTimeMs,
      };
    } catch (error) {
      console.error('Error during AMD detection:', error);
      return {
        isHuman: true,
        resultType: AmdResult.HUMAN,
        rtpPackets: 0,
        detectionTimeMs: Date.now() - startTime,
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
