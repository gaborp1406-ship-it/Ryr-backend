import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardRepository {
  constructor(private readonly dataSource: DataSource) {}

  // =========================================================
  // LEADS POR ETAPA
  // =========================================================
  async fn_contar_clientes_potenciales_por_etapa(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM com_contar_clientes_potenciales_por_etapa($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // LEADS POR FASE
  // =========================================================
  async fn_contar_clientes_potenciales_por_fase(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM com_contar_clientes_potenciales_por_fase($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // ACTIVIDADES
  // =========================================================
  // Se mantiene igual porque esta función SQL
  // no fue modificada para recibir fechas.
  // =========================================================
async fn_contar_actividades_dashboard(
  fechaInicio: string | null,
  fechaFin: string | null,
) {
  const result = await this.dataSource.query(
    `
      SELECT *
      FROM fn_contar_actividades_dashboard($1, $2)
    `,
    [fechaInicio, fechaFin],
  );

  return result;
}

  // =========================================================
  // DESISTIMIENTOS
  // =========================================================
  async fn_contar_desistimientos_dashboard(
    idEtapa: number | null,
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_contar_desistimientos_dashboard($1, $2, $3)
      `,
      [idEtapa, fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // LEADS ATENDIDOS / SIN ATENDER
  // =========================================================
  async fn_contar_leads_atendidos_dashboard(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_contar_leads_atendidos_dashboard($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }
}