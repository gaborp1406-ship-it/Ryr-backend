export declare enum AmdResult {
    HUMAN = "HUMAN",
    MACHINE = "MACHINE"
}
export interface DetectionResult {
    isHuman: boolean;
    resultType: AmdResult;
    rtpPackets: number;
    detectionTimeMs: number;
}
export declare class AmdService {
    detectHuman(channelId: string, timeoutMs?: number): Promise<DetectionResult>;
    private sleep;
}
