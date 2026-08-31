import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ICrearNotificacion, INotificacion } from './notificaciones.interface';


@Injectable()
export class NotificacionesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async crear(data: ICrearNotificacion): Promise<INotificacion> {
    const result: INotificacion[] = await this.dataSource.query(
      `
      INSERT INTO com_notificaciones
        (id_asesor, id_lead, tipo, titulo, mensaje)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, id_asesor, id_lead, tipo, titulo, mensaje, leida, fecha_creacion
      `,
      [data.id_asesor, data.id_lead, data.tipo, data.titulo, data.mensaje],
    );

    return result[0];
  }

  async listarPorAsesor(idAsesor: number): Promise<INotificacion[]> {
    return this.dataSource.query(
      `
      SELECT id, id_asesor, id_lead, tipo, titulo, mensaje, leida, fecha_creacion
      FROM com_notificaciones
      WHERE id_asesor = $1
      ORDER BY fecha_creacion DESC
      LIMIT 50
      `,
      [idAsesor],
    );
  }
async eliminar(id: number): Promise<void> {
  await this.dataSource.query(
    `DELETE FROM com_notificaciones WHERE id = $1`,
    [id],
  );
}

async eliminarTodasLeidas(idAsesor: number): Promise<void> {
  await this.dataSource.query(
    `DELETE FROM com_notificaciones WHERE id_asesor = $1 AND leida = TRUE`,
    [idAsesor],
  );
}
  async marcarLeida(id: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE com_notificaciones SET leida = TRUE WHERE id = $1`,
      [id],
    );
  }

  async marcarTodasLeidas(idAsesor: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE com_notificaciones SET leida = TRUE WHERE id_asesor = $1 AND leida = FALSE`,
      [idAsesor],
    );
  }
}