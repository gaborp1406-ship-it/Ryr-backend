import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { spawn } from 'child_process';

const PREFIX_PHONE = '369051';

@Injectable()
export class AriService {
  private readonly logger = new Logger(AriService.name);

  private readonly host: string;
  private readonly port: string;
  private readonly username: string;
  private readonly password: string;
  private readonly app: string;
  private readonly recordingsBasePath: string;

  constructor(
    private dataSource: DataSource,

    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {
    this.host = this.getEnv('ARI_HOST');
    this.port = this.getEnv('ARI_PORT');
    this.username = this.getEnv('ARI_USERNAME');
    this.password = this.getEnv('ARI_PASSWORD');
    this.app = this.getEnv('ARI_APP');

    this.recordingsBasePath =
      process.env.ARI_RECORDINGS_PATH ||
      '/var/spool/asterisk/recording';
  }

  // ============================================================
  // ENV
  // ============================================================

  private getEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Falta la variable de entorno ${key}`);
    }

    return value;
  }

  // ============================================================
  // ARI URL
  // ============================================================

  private get url() {
    return `http://${this.host}:${this.port}/ari`;
  }

  // ============================================================
  // ARI AUTH
  // ============================================================

  private get auth() {
    return {
      username: this.username,
      password: this.password,
    };
  }

  // ============================================================
  // 404
  // ============================================================

  private isNotFound(error: any): boolean {
    return error?.response?.status === 404;
  }

  // ============================================================
  // INFO ASTERISK
  // ============================================================

  async getInfo() {
    const response = await axios.get(
      `${this.url}/asterisk/info`,
      {
        auth: this.auth,
      },
    );

    return response.data;
  }

  // ============================================================
  // CREAR REGISTRO LLAMADA
  // ============================================================

  async crearRegistroLlamada(
    idTrabajador: number,
    id_etapa_lead: number,
    tipo_historial: number,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM ari_crear_registro_llamada(
          $1,
          $2,
          $3
        )
      `,
      [
        idTrabajador,
        id_etapa_lead,
        tipo_historial,
      ],
    );

    return result[0];
  }

  // ============================================================
  // OBTENER NÚMERO DE SALIDA
  // ============================================================

  async obtenerNumeroSalida(
    idTrabajador: number,
  ): Promise<string> {
    const result = await this.dataSource.query(
      `
        SELECT numero
        FROM trabajador_numero_salida
        WHERE id_trabajador = $1
          AND activo = true
        LIMIT 1
      `,
      [idTrabajador],
    );

    if (!result.length) {
      throw new Error(
        `El trabajador ${idTrabajador} no tiene un número de salida asignado`,
      );
    }

    return result[0].numero;
  }

  // ============================================================
  // LLAMADA
  // ============================================================

  async call(
    agent: string,
    phone: string,
    idTrabajador: number,
    id_etapa_lead: number,
    tipo_historial: number,
    channelId: string,
  ) {
    // ============================================================
    // OBTENER NÚMERO DE SALIDA DEL ASESOR
    // ============================================================

    const numeroSalidaResult =
      await this.dataSource.query(
        `
          SELECT numero
          FROM trabajador_numero_salida
          WHERE id_trabajador = $1
            AND activo = true
          LIMIT 1
        `,
        [idTrabajador],
      );

    if (!numeroSalidaResult.length) {
      throw new Error(
        `El trabajador ${idTrabajador} no tiene un número de salida asignado`,
      );
    }

    const callerId = numeroSalidaResult[0].numero;

    this.logger.log(
      `📞 Número de salida | trabajador=${idTrabajador} | callerId=${callerId}`,
    );

    // ============================================================
    // TELÉFONO DESTINO
    // ============================================================

    const fullPhone = phone.startsWith(PREFIX_PHONE)
      ? phone
      : `${PREFIX_PHONE}${phone}`;

    // ============================================================
    // ORIGINAR LLAMADA
    // ============================================================

    const response = await axios.post(
      `${this.url}/channels`,
      null,
      {
        params: {
          endpoint: `PJSIP/${agent}`,
          app: this.app,
          appArgs: `outbound,${fullPhone}`,

          // Número que verá el cliente
          callerId,

          channelId,
        },

        auth: this.auth,
      },
    );

    // ============================================================
    // REGISTRO BD
    // ============================================================

    const registro =
      await this.crearRegistroLlamada(
        idTrabajador,
        id_etapa_lead,
        tipo_historial,
      );

    this.logger.log(
      `Registro llamada creado: ${JSON.stringify(registro)}`,
    );

    return {
      ...response.data,
      phone: fullPhone,
      idRegistroLlamada: registro.id,
      callerId,
    };
  }

  // ============================================================
  // ORIGINATE GENÉRICO
  // ============================================================

  async originate(
    endpoint: string,
    args: string,
    callerId?: string,
  ) {
    const channelId = uuid();

    const params: Record<string, any> = {
      endpoint,
      app: this.app,
      appArgs: args,
      channelId,
    };

    if (callerId) {
      params.callerId = callerId;
    }

    const response = await axios.post(
      `${this.url}/channels`,
      null,
      {
        params,
        auth: this.auth,
      },
    );

    return response.data;
  }

  // ============================================================
  // CREAR BRIDGE
  // ============================================================

  async createBridge() {
    const response = await axios.post(
      `${this.url}/bridges`,
      null,
      {
        params: {
          type: 'mixing',
        },
        auth: this.auth,
      },
    );

    return response.data;
  }

  // ============================================================
  // AGREGAR CANAL AL BRIDGE
  // ============================================================

  async addChannelToBridge(
    bridgeId: string,
    channelId: string,
  ) {
    const response = await axios.post(
      `${this.url}/bridges/${bridgeId}/addChannel`,
      null,
      {
        params: {
          channel: channelId,
        },
        auth: this.auth,
      },
    );

    return response.data;
  }

  // ============================================================
  // ANSWER
  // ============================================================

  async answer(channelId: string) {
    try {
      await axios.post(
        `${this.url}/channels/${channelId}/answer`,
        null,
        {
          auth: this.auth,
        },
      );
    } catch (error: any) {
      if (this.isNotFound(error)) {
        // El canal colgó justo antes de poder contestarlo.
        return;
      }

      throw error;
    }
  }

  // ============================================================
  // HANGUP
  // ============================================================

  async hangup(channelId: string) {
    try {
      const response = await axios.delete(
        `${this.url}/channels/${channelId}`,
        {
          auth: this.auth,
        },
      );

      return response.data;
    } catch (error: any) {
      if (this.isNotFound(error)) {
        return {
          alreadyGone: true,
        };
      }

      throw error;
    }
  }

  // ============================================================
  // DELETE BRIDGE
  // ============================================================

  async deleteBridge(bridgeId: string) {
    try {
      const response = await axios.delete(
        `${this.url}/bridges/${bridgeId}`,
        {
          auth: this.auth,
        },
      );

      return response.data;
    } catch (error: any) {
      if (this.isNotFound(error)) {
        return {
          alreadyGone: true,
        };
      }

      throw error;
    }
  }

  // ============================================================
  // INICIAR GRABACIÓN DEL BRIDGE
  // ============================================================

  async startBridgeRecording(
    bridgeId: string,
    recordingName: string,
  ) {
    const response = await axios.post(
      `${this.url}/bridges/${bridgeId}/record`,
      null,
      {
        params: {
          name: recordingName,

          // Asterisk genera WAV temporalmente.
          // Luego nosotros lo convertimos a MP3
          // antes de subirlo a Supabase.
          format: 'wav',

          ifExists: 'overwrite',
          beep: false,
        },

        auth: this.auth,
      },
    );

    this.logger.log(
      `🎙️ Grabación iniciada: ${recordingName} | Bridge: ${bridgeId}`,
    );

    return response.data;
  }

  // ============================================================
  // DETENER GRABACIÓN
  // ============================================================

  async stopBridgeRecording(
    recordingName: string,
  ) {
    try {
      const response = await axios.post(
        `${this.url}/recordings/live/${recordingName}/stop`,
        null,
        {
          auth: this.auth,
        },
      );

      this.logger.log(
        `🛑 Grabación finalizada y guardada: ${recordingName}`,
      );

      return response.data;
    } catch (error: any) {
      if (this.isNotFound(error)) {
        this.logger.warn(
          `⚠️ Grabación ${recordingName} ya no existe`,
        );

        return {
          alreadyGone: true,
        };
      }

      throw error;
    }
  }

  // ============================================================
  // VERIFICAR GRABACIÓN STORED
  // ============================================================

  async existeGrabacionStored(
    recordingName: string,
  ): Promise<boolean> {
    try {
      await axios.get(
        `${this.url}/recordings/stored/${recordingName}`,
        {
          auth: this.auth,
        },
      );

      return true;
    } catch (error: any) {
      if (this.isNotFound(error)) {
        return false;
      }

      throw error;
    }
  }

  // ============================================================
  // DESCARGAR WAV DESDE ASTERISK
  // ============================================================

  async descargarGrabacionARI(
    recordingName: string,
  ): Promise<Buffer> {
    const response = await axios.get(
      `${this.url}/recordings/stored/${recordingName}/file`,
      {
        auth: this.auth,
        responseType: 'arraybuffer',
      },
    );

    return Buffer.from(response.data);
  }

  // ============================================================
  // ELIMINAR GRABACIÓN DE ASTERISK
  // ============================================================

  async eliminarGrabacionStoredARI(
    recordingName: string,
  ): Promise<void> {
    try {
      await axios.delete(
        `${this.url}/recordings/stored/${recordingName}`,
        {
          auth: this.auth,
        },
      );
    } catch (error: any) {
      if (!this.isNotFound(error)) {
        this.logger.warn(
          `No se pudo borrar grabación en Asterisk: ${recordingName}`,
        );
      }
    }
  }

  // ============================================================
  // PATH GRABACIÓN WAV
  // ============================================================

  buildRecordingPath(
    recordingName: string,
  ): string {
    return `${this.recordingsBasePath}/${recordingName}.wav`;
  }

  // ============================================================
  // CONVERTIR WAV -> MP3
  // ============================================================

  private async convertirWavAMp3(
    wavBuffer: Buffer,
  ): Promise<Buffer> {
    return new Promise<Buffer>(
      (resolve, reject) => {
        const ffmpeg = spawn(
          'ffmpeg',
          [
            '-hide_banner',
            '-loglevel',
            'error',

            // Entrada desde STDIN
            '-i',
            'pipe:0',

            // Codec MP3
            '-codec:a',
            'libmp3lame',

            // Bitrate para voz
            '-b:a',
            '32k',

            // Voz telefónica
            '-ar',
            '8000',

            // Mono
            '-ac',
            '1',

            // Salida MP3 por STDOUT
            '-f',
            'mp3',
            'pipe:1',
          ],
          {
            stdio: [
              'pipe',
              'pipe',
              'pipe',
            ],
          },
        );

        const chunks: Buffer[] = [];

        let errorOutput = '';

        // ========================================================
        // STDOUT
        // ========================================================

        ffmpeg.stdout.on(
          'data',
          (chunk: Buffer) => {
            chunks.push(
              Buffer.from(chunk),
            );
          },
        );

        // ========================================================
        // STDERR
        // ========================================================

        ffmpeg.stderr.on(
          'data',
          (chunk: Buffer) => {
            errorOutput += chunk.toString();
          },
        );

        // ========================================================
        // ERROR
        // ========================================================

        ffmpeg.on(
          'error',
          (error) => {
            reject(
              new Error(
                `No se pudo ejecutar FFmpeg: ${error.message}`,
              ),
            );
          },
        );

        // ========================================================
        // FINALIZACIÓN
        // ========================================================

        ffmpeg.on(
          'close',
          (code) => {
            if (code !== 0) {
              reject(
                new Error(
                  `FFmpeg terminó con código ${code}: ${errorOutput}`,
                ),
              );

              return;
            }

            const mp3Buffer =
              Buffer.concat(chunks);

            if (!mp3Buffer.length) {
              reject(
                new Error(
                  'FFmpeg generó un MP3 vacío',
                ),
              );

              return;
            }

            resolve(mp3Buffer);
          },
        );

        // ========================================================
        // ENVIAR WAV A FFMPEG
        // ========================================================

        ffmpeg.stdin.on(
          'error',
          (error: any) => {
            // EPIPE puede ocurrir si FFmpeg termina
            // antes de consumir todo el input.
            if (error?.code !== 'EPIPE') {
              reject(error);
            }
          },
        );

        ffmpeg.stdin.end(wavBuffer);
      },
    );
  }

  // ============================================================
  // SUBIR GRABACIÓN A SUPABASE
  //
  // FLUJO:
  //
  // WAV recibido
  //      ↓
  // FFmpeg
  //      ↓
  // MP3 32 kbps
  //      ↓
  // Supabase
  //
  // El Gateway NO necesita modificarse.
  // ============================================================

async subirGrabacionSupabase(
  grabacionNombre: string,
  fileBuffer: Buffer,
): Promise<string> {
  const mp3Buffer = await this.convertirWavAMp3(fileBuffer);

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const storagePath =
    `${year}/${month}/${day}/${grabacionNombre}.mp3`;

  const { data, error } = await this.supabase.storage
    .from('grabaciones')
    .upload(storagePath, mp3Buffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Error subiendo grabación a Supabase: ${error.message}`,
    );
  }

  const { data: publicUrlData } =
    this.supabase.storage
      .from('grabaciones')
      .getPublicUrl(data.path);

  const publicUrl = publicUrlData.publicUrl;

  this.logger.log(
    `☁️ Supabase storage path: ${data.path}`,
  );

  this.logger.log(
    `🔗 Supabase public URL: ${publicUrl}`,
  );

  return publicUrl;
}
  // ============================================================
  // INICIAR GRABACIÓN EN BD
  // ============================================================

  async iniciarGrabacionDb(
    idRegistroLlamada: number,
    grabacionNombre: string,
  ) {
    const result =
      await this.dataSource.query(
        `
          UPDATE com_leads_etapa_contacto_llamada
             SET grabacion_nombre = $1,
                 grabacion_estado = 'grabando',
                 fecha_inicio =
                   COALESCE(
                     fecha_inicio,
                     CURRENT_TIMESTAMP
                   )
           WHERE id = $2
        `,
        [
          grabacionNombre,
          idRegistroLlamada,
        ],
      );

    this.logger.log(
      `📝 iniciarGrabacionDb: ` +
      `id=${idRegistroLlamada} ` +
      `nombre=${grabacionNombre} ` +
      `filas_afectadas=${result[1]}`,
    );

    if (result[1] === 0) {
      this.logger.warn(
        `⚠️ iniciarGrabacionDb no afectó ninguna fila. ` +
        `¿Existe el registro id=${idRegistroLlamada}?`,
      );
    }
  }

  // ============================================================
  // FINALIZAR GRABACIÓN EN BD
  // ============================================================

  async finalizarGrabacionDb(
    idRegistroLlamada: number,
    grabacionPath: string,
    estado:
      | 'completada'
      | 'error' = 'completada',
  ) {
    const result =
      await this.dataSource.query(
        `
          UPDATE com_leads_etapa_contacto_llamada
             SET grabacion_path = $1,
                 grabacion_estado = $2,
                 fecha_fin = CURRENT_TIMESTAMP
           WHERE id = $3
        `,
        [
          grabacionPath,
          estado,
          idRegistroLlamada,
        ],
      );

    this.logger.log(
      `📝 finalizarGrabacionDb: ` +
      `id=${idRegistroLlamada} ` +
      `estado=${estado} ` +
      `filas_afectadas=${result[1]}`,
    );

    if (result[1] === 0) {
      this.logger.warn(
        `⚠️ finalizarGrabacionDb no afectó ninguna fila. ` +
        `¿Existe el registro id=${idRegistroLlamada}?`,
      );
    }
  }
}