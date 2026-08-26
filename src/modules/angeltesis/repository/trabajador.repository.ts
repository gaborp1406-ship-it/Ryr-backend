import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AngelRepository {
  constructor(private dataSource: DataSource) {}

 async fn_listar_estados_conexion() {
    const result = await this.dataSource.query(
      `SELECT * FROM fn_listar_estados_conexion()`,
    );
    return result;
  }

 
}