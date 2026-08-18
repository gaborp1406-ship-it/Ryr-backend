import { DataSource } from 'typeorm';
export declare class AriService {
    private dataSource;
    private readonly logger;
    private readonly host;
    private readonly port;
    private readonly username;
    private readonly password;
    private readonly app;
    constructor(dataSource: DataSource);
    private getEnv;
    private get url();
    private get auth();
    private isNotFound;
    getInfo(): Promise<any>;
    crearRegistroLlamada(idTrabajador: number): Promise<any>;
    call(agent: string, phone: string, idTrabajador: number, channelId: string): Promise<any>;
    originate(endpoint: string, args: string): Promise<any>;
    createBridge(): Promise<any>;
    addChannelToBridge(bridgeId: string, channelId: string): Promise<any>;
    answer(channelId: string): Promise<void>;
    hangup(channelId: string): Promise<any>;
    deleteBridge(bridgeId: string): Promise<any>;
}
