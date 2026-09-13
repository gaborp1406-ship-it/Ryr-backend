import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { DashboardRepository } from './repository/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) {}

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
}