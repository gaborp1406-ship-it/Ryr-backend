import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'src/interfaces/responses.interface';
import {
  RegistroTomado,
  ResultadoNoContesta,
} from '../interfaces/cola.interfaces';

@Injectable()
export class ColaRepository {
  constructor(private dataSource: DataSource) {}

  async ari_tomar_registro(
    idCola: number,
    id_usuario: number | null,
  ): Promise<RegistroTomado | null> {
    const result = await this.dataSource.query<RegistroTomado[]>(
      `SELECT * FROM fn_ari_tomar_registro($1)`,
      [idCola, id_usuario],
    );
    return result[0] ?? null;
  }

  async ari_manejar_no_contesta(idCola: number): Promise<ResultadoNoContesta> {
    const result = await this.dataSource.query<ResultadoNoContesta[]>(
      `SELECT * FROM ari_manejar_no_contesta($1)`,
      [idCola],
    );
    return result[0];
  }

  async ari_marcar_trunk_lleno(idCola: number): Promise<Response> {
    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM ari_marcar_trunk_lleno($1)`,
      [idCola],
    );
    return result[0];
  }
}
