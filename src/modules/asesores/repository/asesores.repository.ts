import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IOpcionesListado,
  IAsesor,
} from '../interface/asesores.interface';

@Injectable()
export class AsesoresRepository {
  constructor(private dataSource: DataSource) {}

  async gen_listar_asesor_disponible(id_trabajador: number) {
    const result: IOpcionesListado[] = await this.dataSource.query(
      `SELECT * FROM fn_obtener_asesor_disponible_v2($1)`,
      [id_trabajador],
    );

    return result;
  }

  async gen_listar_asesores() {
    const result: IAsesor[] = await this.dataSource.query(
      `SELECT * FROM fn_listar_asesores_v2()`, 
    );

    return result;
  }
}