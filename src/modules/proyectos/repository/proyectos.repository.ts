import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IOpcionesListado } from '../interface/proyectos.interface';
@Injectable()
export class ProyectosRepository {
  constructor(private dataSource: DataSource) {}

  async gen_listar_proyectos(id_empresa: number) {
    const result: IOpcionesListado[] = await this.dataSource.query(
      `SELECT * FROM gen_listar_proyectos_empresa($1)`,
      [id_empresa],
    );
    return result;
  }
}
