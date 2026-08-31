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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AriService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const axios_1 = __importDefault(require("axios"));
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const PREFIX_PHONE = '366651';
let AriService = AriService_1 = class AriService {
    dataSource;
    supabase;
    logger = new common_1.Logger(AriService_1.name);
    host;
    port;
    username;
    password;
    app;
    recordingsBasePath;
    constructor(dataSource, supabase) {
        this.dataSource = dataSource;
        this.supabase = supabase;
        this.host = this.getEnv('ARI_HOST');
        this.port = this.getEnv('ARI_PORT');
        this.username = this.getEnv('ARI_USERNAME');
        this.password = this.getEnv('ARI_PASSWORD');
        this.app = this.getEnv('ARI_APP');
        this.recordingsBasePath =
            process.env.ARI_RECORDINGS_PATH || '/var/spool/asterisk/recording';
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
    async crearRegistroLlamada(idTrabajador, id_etapa_lead, tipo_historial) {
        const result = await this.dataSource.query(`
        SELECT *
        FROM ari_crear_registro_llamada(
            $1,
            $2,
            $3
          
       
        )
        `, [idTrabajador, id_etapa_lead, tipo_historial]);
        return result[0];
    }
    async obtenerNumeroSalida(idTrabajador) {
        const result = await this.dataSource.query(`
      SELECT numero
      FROM trabajador_numero_salida
      WHERE id_trabajador = $1
        AND activo = true
      LIMIT 1
    `, [idTrabajador]);
        if (!result.length) {
            throw new Error(`El trabajador ${idTrabajador} no tiene un número de salida asignado`);
        }
        return result[0].numero;
    }
    async call(agent, phone, idTrabajador, id_etapa_lead, tipo_historial, channelId) {
        const numeroSalidaResult = await this.dataSource.query(`
      SELECT numero
      FROM trabajador_numero_salida
      WHERE id_trabajador = $1
        AND activo = true
      LIMIT 1
    `, [idTrabajador]);
        if (!numeroSalidaResult.length) {
            throw new Error(`El trabajador ${idTrabajador} no tiene un número de salida asignado`);
        }
        const callerId = numeroSalidaResult[0].numero;
        this.logger.log(`📞 Número de salida | trabajador=${idTrabajador} | callerId=${callerId}`);
        const fullPhone = phone.startsWith(PREFIX_PHONE)
            ? phone
            : `${PREFIX_PHONE}${phone}`;
        const response = await axios_1.default.post(`${this.url}/channels`, null, {
            params: {
                endpoint: `PJSIP/${agent}`,
                app: this.app,
                appArgs: `outbound,${fullPhone}`,
                callerId,
                channelId,
            },
            auth: this.auth,
        });
        const registro = await this.crearRegistroLlamada(idTrabajador, id_etapa_lead, tipo_historial);
        this.logger.log(`Registro llamada creado: ${JSON.stringify(registro)}`);
        return {
            ...response.data,
            phone: fullPhone,
            idRegistroLlamada: registro.id,
            callerId,
        };
    }
    async originate(endpoint, args, callerId) {
        const channelId = (0, uuid_1.v4)();
        const params = {
            endpoint,
            app: this.app,
            appArgs: args,
            channelId,
        };
        if (callerId) {
            params.callerId = callerId;
        }
        const response = await axios_1.default.post(`${this.url}/channels`, null, {
            params,
            auth: this.auth,
        });
        return response.data;
    }
    async createBridge() {
        const response = await axios_1.default.post(`${this.url}/bridges`, null, {
            params: { type: 'mixing' },
            auth: this.auth,
        });
        return response.data;
    }
    async addChannelToBridge(bridgeId, channelId) {
        const response = await axios_1.default.post(`${this.url}/bridges/${bridgeId}/addChannel`, null, { params: { channel: channelId }, auth: this.auth });
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
            const response = await axios_1.default.delete(`${this.url}/channels/${channelId}`, { auth: this.auth });
            return response.data;
        }
        catch (error) {
            if (this.isNotFound(error)) {
                return { alreadyGone: true };
            }
            throw error;
        }
    }
    async deleteBridge(bridgeId) {
        try {
            const response = await axios_1.default.delete(`${this.url}/bridges/${bridgeId}`, { auth: this.auth });
            return response.data;
        }
        catch (error) {
            if (this.isNotFound(error)) {
                return { alreadyGone: true };
            }
            throw error;
        }
    }
    async startBridgeRecording(bridgeId, recordingName) {
        const response = await axios_1.default.post(`${this.url}/bridges/${bridgeId}/record`, null, {
            params: {
                name: recordingName,
                format: 'wav',
                ifExists: 'overwrite',
                beep: false,
            },
            auth: this.auth,
        });
        this.logger.log(`🎙️ Grabación iniciada: ${recordingName} | Bridge: ${bridgeId}`);
        return response.data;
    }
    async stopBridgeRecording(recordingName) {
        try {
            const response = await axios_1.default.post(`${this.url}/recordings/live/${recordingName}/stop`, null, {
                auth: this.auth,
            });
            this.logger.log(`🛑 Grabación finalizada y guardada: ${recordingName}`);
            return response.data;
        }
        catch (error) {
            if (this.isNotFound(error)) {
                this.logger.warn(`⚠️ Grabación ${recordingName} ya no existe`);
                return { alreadyGone: true };
            }
            throw error;
        }
    }
    async existeGrabacionStored(recordingName) {
        try {
            await axios_1.default.get(`${this.url}/recordings/stored/${recordingName}`, {
                auth: this.auth,
            });
            return true;
        }
        catch (error) {
            if (this.isNotFound(error))
                return false;
            throw error;
        }
    }
    async descargarGrabacionARI(recordingName) {
        const response = await axios_1.default.get(`${this.url}/recordings/stored/${recordingName}/file`, { auth: this.auth, responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
    async eliminarGrabacionStoredARI(recordingName) {
        try {
            await axios_1.default.delete(`${this.url}/recordings/stored/${recordingName}`, {
                auth: this.auth,
            });
        }
        catch (error) {
            if (!this.isNotFound(error)) {
                this.logger.warn(`No se pudo borrar grabación en Asterisk: ${recordingName}`);
            }
        }
    }
    buildRecordingPath(recordingName) {
        return `${this.recordingsBasePath}/${recordingName}.wav`;
    }
    async subirGrabacionSupabase(grabacionNombre, fileBuffer) {
        const ahora = new Date();
        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0');
        const day = String(ahora.getDate()).padStart(2, '0');
        const storagePath = `${year}/${month}/${day}/${grabacionNombre}.wav`;
        this.logger.log(`☁️ Subiendo a Supabase: ${storagePath}`);
        const { data, error } = await this.supabase.storage
            .from('grabaciones')
            .upload(storagePath, fileBuffer, {
            contentType: 'audio/wav',
            upsert: false,
        });
        if (error) {
            this.logger.error(`❌ Supabase Storage: ${error.message}`);
            throw error;
        }
        const { data: publicUrlData } = this.supabase.storage
            .from('grabaciones')
            .getPublicUrl(data.path);
        const publicUrl = publicUrlData.publicUrl;
        this.logger.log(`✅ Subida correctamente: ${publicUrl}`);
        return publicUrl;
    }
    async iniciarGrabacionDb(idRegistroLlamada, grabacionNombre) {
        const result = await this.dataSource.query(`
      UPDATE com_leads_etapa_contacto_llamada
         SET grabacion_nombre = $1,
             grabacion_estado = 'grabando',
             fecha_inicio = COALESCE(fecha_inicio, CURRENT_TIMESTAMP)
       WHERE id = $2
    `, [grabacionNombre, idRegistroLlamada]);
        this.logger.log(`📝 iniciarGrabacionDb: id=${idRegistroLlamada} nombre=${grabacionNombre} filas_afectadas=${result[1]}`);
        if (result[1] === 0) {
            this.logger.warn(`⚠️ iniciarGrabacionDb no afectó ninguna fila. ¿Existe el registro id=${idRegistroLlamada}?`);
        }
    }
    async finalizarGrabacionDb(idRegistroLlamada, grabacionPath, estado = 'completada') {
        const result = await this.dataSource.query(`
      UPDATE com_leads_etapa_contacto_llamada
         SET grabacion_path = $1,
             grabacion_estado = $2,
             fecha_fin = CURRENT_TIMESTAMP
       WHERE id = $3
    `, [grabacionPath, estado, idRegistroLlamada]);
        this.logger.log(`📝 finalizarGrabacionDb: id=${idRegistroLlamada} estado=${estado} filas_afectadas=${result[1]}`);
        if (result[1] === 0) {
            this.logger.warn(`⚠️ finalizarGrabacionDb no afectó ninguna fila. ¿Existe el registro id=${idRegistroLlamada}?`);
        }
    }
};
exports.AriService = AriService;
exports.AriService = AriService = AriService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        supabase_js_1.SupabaseClient])
], AriService);
//# sourceMappingURL=asterisk.service.js.map