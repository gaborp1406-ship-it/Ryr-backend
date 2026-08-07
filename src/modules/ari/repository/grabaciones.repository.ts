import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'src/interfaces/responses.interface';
import {
  GrabacionCreada,
  ContactoRow,
} from '../interfaces/grabaciones.interfaces';

@Injectable()
export class GrabacionesRepository {
  constructor(private dataSource: DataSource) {}

  async ari_crear_grabacion(
    call_id: string,
    idRegistroLlamada: number,
    id_usuario: number | null,
  ): Promise<number> {
    const result = await this.dataSource.query<GrabacionCreada[]>(
      `SELECT * FROM ari_crear_grabacion($1, $2, $3)`,
      [call_id, idRegistroLlamada, id_usuario],
    );

    if (!result || !result[0]) {
      throw new Error('ari_crear_grabacion devolvió resultado vacío');
    }
    return result[0].id;
  }

  async ari_actualizar_grabacion(
    idGrabacion: number,
    duracionSegundos: number,
    url: string,
  ): Promise<Response> {
    const h = Math.floor(duracionSegundos / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((duracionSegundos % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (duracionSegundos % 60).toString().padStart(2, '0');

    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM ari_actualizar_grabacion($1, $2, $3)`,
      [idGrabacion, `${h}:${m}:${s}`, url],
    );
    return result[0];
  }

  async ari_actualizar_grabacion_llamada(
    idRegistroLlamada: number,
    idRegistroGrabacion: number,
  ) {
    await this.dataSource.query(
      `SELECT ari_actualizar_grabacion_llamada($1, $2)`,
      [idRegistroLlamada, idRegistroGrabacion],
    );
  }

  async ari_buscar_contacto_por_numero(
    numero: string,
  ): Promise<ContactoRow | null> {
    const result = await this.dataSource.query<ContactoRow[]>(
      `SELECT * FROM ari_buscar_contacto_por_numero($1)`,
      [numero],
    );
    return result[0] ?? null;
  }
}
