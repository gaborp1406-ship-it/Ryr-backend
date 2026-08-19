import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

const PREFIX_PHONE = '366651';

@Injectable()
export class AriService {
  private readonly logger = new Logger(AriService.name);

  private readonly host: string;
  private readonly port: string;
  private readonly username: string;
  private readonly password: string;
  private readonly app: string;

  constructor(private dataSource: DataSource) {
    this.host = this.getEnv('ARI_HOST');
    this.port = this.getEnv('ARI_PORT');
    this.username = this.getEnv('ARI_USERNAME');
    this.password = this.getEnv('ARI_PASSWORD');
    this.app = this.getEnv('ARI_APP');
  }

  private getEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Falta la variable de entorno ${key}`);
    }

    return value;
  }

  private get url() {
    return `http://${this.host}:${this.port}/ari`;
  }

  private get auth() {
    return {
      username: this.username,
      password: this.password,
    };
  }

  private isNotFound(error: any): boolean {
    return error?.response?.status === 404;
  }

  async getInfo() {
    const response = await axios.get(
      `${this.url}/asterisk/info`,
      {
        auth: this.auth,
      },
    );

    return response.data;
  }

  async crearRegistroLlamada(
    idTrabajador: number,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM ari_crear_registro_llamada($1)
      `,
      [idTrabajador],
    );

    return result[0];
  }

async call(
  agent: string,
  phone: string,
  idTrabajador: number,
  channelId: string,
) {
  const fullPhone = phone.startsWith(PREFIX_PHONE)
    ? phone
    : `${PREFIX_PHONE}${phone}`;

  this.logger.log(`Originando llamada hacia agente: ${agent}`);

  const response = await axios.post(
    `${this.url}/channels`,
    null,
    {
      params: {
        endpoint: `PJSIP/${agent}`,       // 👈 ahora sí, el agente
        app: this.app,
        appArgs: `outbound,${fullPhone}`, // el teléfono viaja como arg, no como endpoint
        callerId: fullPhone,              // opcional: mostrarle al agente qué numero está marcando
        channelId,
      },
      auth: this.auth,
    },
  );

  this.logger.log(`Canal Asterisk creado: ${response.data.id}`);

  const registro = await this.crearRegistroLlamada(idTrabajador);
  this.logger.log(`Registro llamada creado: ${JSON.stringify(registro)}`);

  return {
    ...response.data,
    phone: fullPhone,
    idRegistroLlamada: registro.id,
  };
}

  async originate(
    endpoint: string,
    args: string,
  ) {
    const channelId = uuid();

    const response = await axios.post(
      `${this.url}/channels`,
      null,
      {
        params: {
          endpoint,
          app: this.app,
          appArgs: args,
          channelId,
        },
        auth: this.auth,
      },
    );

    return response.data;
  }

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
        return;
      }

      throw error;
    }
  }

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
}