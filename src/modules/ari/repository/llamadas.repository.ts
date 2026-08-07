import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'src/interfaces/responses.interface';
import { RegistroLlamadaCreado } from '../interfaces/llamadas.interfaces';

@Injectable()
export class LlamadasRepository {
  constructor(private dataSource: DataSource) {}

  async ari_crear_registro_llamada(
    idContacto: number,
    idTrabajador: number,
    idCampania: number,
    intentos: number,
    id_usuario: number | null,
    id_proceso_saliente: number | null,
  ): Promise<number> {
    const result = await this.dataSource.query<RegistroLlamadaCreado[]>(
      `SELECT * FROM ari_crear_registro_llamada($1, $2, $3, $4, $5, $6)`,
      [
        idContacto,
        idTrabajador,
        idCampania,
        intentos,
        id_usuario,
        id_proceso_saliente,
      ],
    );
    return result[0].id;
  }

  async ari_finalizar_llamada(
    idRegistroLlamada: number,
    idGrabacion: number,
  ): Promise<Response> {
    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM ari_finalizar_llamada($1, $2)`,
      [idRegistroLlamada, idGrabacion],
    );
    return result[0];
  }

  async ari_marcar_reintento(idRegistroLlamada: number): Promise<Response> {
    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM ari_marcar_reintento($1)`,
      [idRegistroLlamada],
    );
    return result[0];
  }
}
