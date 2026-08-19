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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AriService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const PREFIX_PHONE = '366651';
let AriService = AriService_1 = class AriService {
    dataSource;
    logger = new common_1.Logger(AriService_1.name);
    host;
    port;
    username;
    password;
    app;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.host = this.getEnv('ARI_HOST');
        this.port = this.getEnv('ARI_PORT');
        this.username = this.getEnv('ARI_USERNAME');
        this.password = this.getEnv('ARI_PASSWORD');
        this.app = this.getEnv('ARI_APP');
    }
    getEnv(key) {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Falta la variable de entorno ${key}`);
        }
        return value;
    }
    get url() {
        return `http://${this.host}:${this.port}/ari`;
    }
    get auth() {
        return {
            username: this.username,
            password: this.password,
        };
    }
    isNotFound(error) {
        return error?.response?.status === 404;
    }
    async getInfo() {
        const response = await axios_1.default.get(`${this.url}/asterisk/info`, {
            auth: this.auth,
        });
        return response.data;
    }
    async crearRegistroLlamada(idTrabajador) {
        const result = await this.dataSource.query(`
        SELECT *
        FROM ari_crear_registro_llamada($1)
      `, [idTrabajador]);
        return result[0];
    }
    async call(agent, phone, idTrabajador, channelId) {
        const fullPhone = phone.startsWith(PREFIX_PHONE)
            ? phone
            : `${PREFIX_PHONE}${phone}`;
        this.logger.log(`Originando llamada hacia agente: ${agent}`);
        const response = await axios_1.default.post(`${this.url}/channels`, null, {
            params: {
                endpoint: `PJSIP/${agent}`,
                app: this.app,
                appArgs: `outbound,${fullPhone}`,
                callerId: fullPhone,
                channelId,
            },
            auth: this.auth,
        });
        this.logger.log(`Canal Asterisk creado: ${response.data.id}`);
        const registro = await this.crearRegistroLlamada(idTrabajador);
        this.logger.log(`Registro llamada creado: ${JSON.stringify(registro)}`);
        return {
            ...response.data,
            phone: fullPhone,
            idRegistroLlamada: registro.id,
        };
    }
    async originate(endpoint, args) {
        const channelId = (0, uuid_1.v4)();
        const response = await axios_1.default.post(`${this.url}/channels`, null, {
            params: {
                endpoint,
                app: this.app,
                appArgs: args,
                channelId,
            },
            auth: this.auth,
        });
        return response.data;
    }
    async createBridge() {
        const response = await axios_1.default.post(`${this.url}/bridges`, null, {
            params: {
                type: 'mixing',
            },
            auth: this.auth,
        });
        return response.data;
    }
    async addChannelToBridge(bridgeId, channelId) {
        const response = await axios_1.default.post(`${this.url}/bridges/${bridgeId}/addChannel`, null, {
            params: {
                channel: channelId,
            },
            auth: this.auth,
        });
        return response.data;
    }
    async answer(channelId) {
        try {
            await axios_1.default.post(`${this.url}/channels/${channelId}/answer`, null, {
                auth: this.auth,
            });
        }
        catch (error) {
            if (this.isNotFound(error)) {
                return;
            }
            throw error;
        }
    }
    async hangup(channelId) {
        try {
            const response = await axios_1.default.delete(`${this.url}/channels/${channelId}`, {
                auth: this.auth,
            });
            return response.data;
        }
        catch (error) {
            if (this.isNotFound(error)) {
                return {
                    alreadyGone: true,
                };
            }
            throw error;
        }
    }
    async deleteBridge(bridgeId) {
        try {
            const response = await axios_1.default.delete(`${this.url}/bridges/${bridgeId}`, {
                auth: this.auth,
            });
            return response.data;
        }
        catch (error) {
            if (this.isNotFound(error)) {
                return {
                    alreadyGone: true,
                };
            }
            throw error;
        }
    }
};
exports.AriService = AriService;
exports.AriService = AriService = AriService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AriService);
//# sourceMappingURL=asterisk.service.js.map