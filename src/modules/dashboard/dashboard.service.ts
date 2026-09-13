import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { DashboardRepository } from './repository/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) { }

  // =========================================================
  // LEADS POR ETAPA
  // =========================================================
  async contarLeadsPorEtapa(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_contar_clientes_potenciales_por_etapa(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar leads por etapa:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar leads por etapa',
      );
    }
  }

  // =========================================================
  // LEADS POR FASE
  // =========================================================
  async contarLeadsPorFase(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_contar_clientes_potenciales_por_fase(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar leads por fase:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar leads por fase',
      );
    }
  }

  // =========================================================
  // ACTIVIDADES
  // =========================================================
  async contarActividades(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_contar_actividades_dashboard(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar actividades del dashboard:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar actividades del dashboard',
      );
    }
  }

  // =========================================================
  // DESISTIMIENTOS
  // =========================================================
  async contarDesistimientos(
    idEtapa: number | null,
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_contar_desistimientos_dashboard(
          idEtapa,
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar desistimientos:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar desistimientos',
      );
    }
  }

  // =========================================================
  // LEADS ATENDIDOS / SIN ATENDER
  // =========================================================
  async contarLeadsAtendidos(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_contar_leads_atendidos_dashboard(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar leads atendidos:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar leads atendidos',
      );
    }
  }

  // =========================================================
  // 1. LEADS EN CIERRE
  // =========================================================
  async contarLeadsCierre(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_leads_cierre(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar leads en cierre:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar leads en cierre',
      );
    }
  }

  // =========================================================
  // 2. TOTAL DE LEADS
  // =========================================================
  async contarTotalLeads(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_total_leads(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar total de leads:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar total de leads',
      );
    }
  }

  // =========================================================
  // 3. CIERRES POR PROYECTO
  // =========================================================
  async contarCierresPorProyecto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_cierres_por_proyecto(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar cierres por proyecto:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar cierres por proyecto',
      );
    }
  }

  // =========================================================
  // 4. CIERRES POR FUENTE
  // =========================================================
  async contarCierresPorFuente(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_cierres_por_fuente(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar cierres por fuente:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar cierres por fuente',
      );
    }
  }

  // =========================================================
  // 5. CIERRES POR ASESOR
  // =========================================================
  async contarCierresPorAsesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_cierres_por_asesor(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar cierres por asesor:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar cierres por asesor',
      );
    }
  }

  // =========================================================
  // 6. TOTAL DE LEADS POR FUENTE
  // =========================================================
  async contarTotalLeadsPorFuente(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_total_leads_por_fuente(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar total de leads por fuente:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar total de leads por fuente',
      );
    }
  }

  // =========================================================
  // 7. TASA DE CIERRE
  // =========================================================
  async contarTasaCierre(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_tasa_cierre(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al calcular tasa de cierre:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al calcular tasa de cierre',
      );
    }
  }

  async contarLeadsNegociacion(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_leads_negociacion(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar leads en negociación:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar leads en negociación',
      );
    }
  }

  async contarNegociacionPorFuente(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_negociacion_por_fuente(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar negociación por fuente:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar negociación por fuente',
      );
    }
  }

  async contarNegociacionPorProyecto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_negociacion_por_proyecto(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar negociación por proyecto:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar negociación por proyecto',
      );
    }
  }

  async contarNegociacionPorAsesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_negociacion_por_asesor(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al contar negociación por asesor:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al contar negociación por asesor',
      );
    }
  }

  async listarLeadsNegociacion(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_listar_leads_negociacion(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al listar leads en negociación:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al listar leads en negociación',
      );
    }
  }

  async contactoPorAsesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_contacto_por_asesor(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al obtener contacto por asesor:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al obtener contacto por asesor',
      );
    }
  }


  async rangosContacto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_rangos_contacto(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al obtener rangos de contacto:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al obtener rangos de contacto',
      );
    }
  }


  async resumenContacto(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_resumen_contacto(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al obtener resumen de contacto:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al obtener resumen de contacto',
      );
    }
  }


  async leadsContactadosAsesor(
    fechaInicio: string | null,
    fechaFin: string | null,
  ) {
    try {
      return await this.dashboardRepository
        .fn_dashboard_leads_contactados_asesor(
          fechaInicio,
          fechaFin,
        );
    } catch (error) {
      console.error(
        'Error al obtener leads contactados por asesor:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al obtener leads contactados por asesor',
      );
    }
  }
}