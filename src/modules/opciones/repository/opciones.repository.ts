import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IOpcionesListado } from '../interface/opciones.interface';
@Injectable()
export class OpcionesRepository {
  constructor(private dataSource: DataSource) {}

  async gen_listado_opciones_listar(id_listado: number) {
    const result: IOpcionesListado[] = await this.dataSource.query(
      `SELECT * FROM gen_listado_opciones_listar($1)`,
      [id_listado],
    );
    return result;
  }
}
