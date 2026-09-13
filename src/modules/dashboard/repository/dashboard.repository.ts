import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardRepository {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

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
      [
        idEtapa,
        fechaInicio,
        fechaFin,
      ],
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

  // =========================================================
  // 1. LEADS EN CIERRE
  // =========================================================
  async fn_dashboard_leads_cierre(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_leads_cierre($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // 2. TOTAL DE LEADS
  // =========================================================
  async fn_dashboard_total_leads(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_total_leads($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // 3. CIERRES POR PROYECTO
  // =========================================================
  async fn_dashboard_cierres_por_proyecto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_cierres_por_proyecto($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // 4. CIERRES POR FUENTE
  // =========================================================
  async fn_dashboard_cierres_por_fuente(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_cierres_por_fuente($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // 5. CIERRES POR ASESOR
  // =========================================================
  async fn_dashboard_cierres_por_asesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_cierres_por_asesor($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // 6. TOTAL DE LEADS POR FUENTE
  // =========================================================
  async fn_dashboard_total_leads_por_fuente(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_total_leads_por_fuente($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  // =========================================================
  // 7. TASA DE CIERRE
  // =========================================================
  async fn_dashboard_tasa_cierre(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_tasa_cierre($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  async fn_dashboard_leads_negociacion(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_leads_negociacion($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  async fn_dashboard_negociacion_por_fuente(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_negociacion_por_fuente($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  async fn_dashboard_negociacion_por_proyecto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_negociacion_por_proyecto($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  async fn_dashboard_negociacion_por_asesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_negociacion_por_asesor($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  async fn_dashboard_listar_leads_negociacion(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM fn_dashboard_listar_leads_negociacion($1, $2)
      `,
      [fechaInicio, fechaFin],
    );

    return result;
  }

  async fn_dashboard_contacto_por_asesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_dashboard_contacto_por_asesor($1, $2)
    `,
      [fechaInicio, fechaFin],
    );

    return result;
  }


  async fn_dashboard_rangos_contacto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_dashboard_rangos_contacto($1, $2)
    `,
      [fechaInicio, fechaFin],
    );

    return result;
  }


  async fn_dashboard_resumen_contacto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_dashboard_resumen_contacto($1, $2)
    `,
      [fechaInicio, fechaFin],
    );

    return result;
  }


  async fn_dashboard_leads_contactados_asesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    const result = await this.dataSource.query(
      `
      SELECT *
      FROM fn_dashboard_leads_contactados_asesor($1, $2)
    `,
      [fechaInicio, fechaFin],
    );

    return result;
  }
}