import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TrabajadorRepository {
  constructor(private dataSource: DataSource) {}

 async fn_listar_estados_conexion() {
    const result = await this.dataSource.query(
      `SELECT * FROM fn_listar_estados_conexion()`,
    );
    return result;
  }

  async fn_obtener_estado_actual_asesor(id_trabajador: number) {
    const result = await this.dataSource.query(
      `SELECT * FROM fn_obtener_estado_actual_asesor($1)`,
      [id_trabajador],
    );
    return result[0] ?? null;
  }

  async fn_cambiar_estado_asesor(id_trabajador: number, id_estado: number) {
    const result = await this.dataSource.query(
      `SELECT * FROM fn_cambiar_estado_asesor($1, $2)`,
      [id_trabajador, id_estado],
    );
    return result[0];
  }

  async fn_listar_estado_actual_trabajadores(id_estado?: number | null) {
    const result = await this.dataSource.query(
      `SELECT * FROM fn_listar_estado_actual_trabajadores($1)`,
      [id_estado ?? null],
    );
    return result;
  }

  async fn_historial_estado_trabajador(
    id_trabajador: number,
    id_estado?: number | null,
    fecha_desde?: string | null,
    fecha_hasta?: string | null,
  ) {
    const result = await this.dataSource.query(
      `SELECT * FROM fn_historial_estado_trabajador($1, $2, $3, $4)`,
      [
        id_trabajador,
        id_estado ?? null,
        fecha_desde ?? null,
        fecha_hasta ?? null,
      ],
    );
    return result;
  }
}