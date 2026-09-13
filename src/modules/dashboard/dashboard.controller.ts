import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) { }

  // =========================================================
  // VALIDAR FECHA
  // =========================================================
  private validarFecha(
    fecha: string | undefined,
  ): string | null {
    if (
      fecha === undefined ||
      fecha === null ||
      fecha.trim() === ''
    ) {
      return null;
    }

    const fechaLimpia = fecha.trim();

    // Formato exacto YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(fechaLimpia)) {
      throw new BadRequestException(
        `Fecha inválida: ${fecha}. Use el formato YYYY-MM-DD`,
      );
    }

    // Validar que realmente sea una fecha existente
    const [anio, mes, dia] = fechaLimpia
      .split('-')
      .map(Number);

    const fechaObj = new Date(
      Date.UTC(anio, mes - 1, dia),
    );

    if (
      fechaObj.getUTCFullYear() !== anio ||
      fechaObj.getUTCMonth() !== mes - 1 ||
      fechaObj.getUTCDate() !== dia
    ) {
      throw new BadRequestException(
        `Fecha inválida: ${fecha}`,
      );
    }

    return fechaLimpia;
  }

  // =========================================================
  // VALIDAR RANGO DE FECHAS
  // =========================================================
  private obtenerRangoFechas(
    fechaInicio?: string,
    fechaFin?: string,
  ) {
    const pFechaInicio =
      this.validarFecha(fechaInicio);

    const pFechaFin =
      this.validarFecha(fechaFin);

    if (
      pFechaInicio !== null &&
      pFechaFin !== null &&
      pFechaInicio > pFechaFin
    ) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor que la fecha de fin',
      );
    }

    return {
      fechaInicio: pFechaInicio,
      fechaFin: pFechaFin,
    };
  }

  // =========================================================
  // LEADS POR ETAPA
  // =========================================================
  @Get('leads-por-etapa')
  @UseGuards(JwtAuthGuard)
  contarLeadsPorEtapa(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    const {
      fechaInicio: pFechaInicio,
      fechaFin: pFechaFin,
    } = this.obtenerRangoFechas(
      fechaInicio,
      fechaFin,
    );

    return this.dashboardService.contarLeadsPorEtapa(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // LEADS POR FASE
  // =========================================================
  @Get('leads-por-fase')
  @UseGuards(JwtAuthGuard)
  contarLeadsPorFase(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    const {
      fechaInicio: pFechaInicio,
      fechaFin: pFechaFin,
    } = this.obtenerRangoFechas(
      fechaInicio,
      fechaFin,
    );

    return this.dashboardService.contarLeadsPorFase(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // ACTIVIDADES
  // =========================================================
  @Get('actividades')
  @UseGuards(JwtAuthGuard)
  contarActividades(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const {
      fechaInicio: pFechaInicio,
      fechaFin: pFechaFin,
    } = this.obtenerRangoFechas(
      fechaInicio,
      fechaFin,
    );

    return this.dashboardService.contarActividades(
      pFechaInicio,
      pFechaFin,
    );
  }
  // =========================================================
  // DESISTIMIENTOS
  //
  // id_etapa:
  // 3 = Desistio
  // 8 = Desistio - Oportunidad
  // null = ambos
  // =========================================================
  @Get('desistimientos')
  @UseGuards(JwtAuthGuard)
  contarDesistimientos(
    @Query('id_etapa') idEtapa?: string,
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    const pIdEtapa =
      idEtapa !== undefined &&
        idEtapa !== null &&
        idEtapa !== ''
        ? Number(idEtapa)
        : null;

    // Validar id_etapa
    if (
      pIdEtapa !== null &&
      !Number.isInteger(pIdEtapa)
    ) {
      throw new BadRequestException(
        'id_etapa debe ser un número entero',
      );
    }

    if (
      pIdEtapa !== null &&
      pIdEtapa !== 3 &&
      pIdEtapa !== 8
    ) {
      throw new BadRequestException(
        'id_etapa debe ser 3, 8 o estar vacío',
      );
    }

    const {
      fechaInicio: pFechaInicio,
      fechaFin: pFechaFin,
    } = this.obtenerRangoFechas(
      fechaInicio,
      fechaFin,
    );

    return this.dashboardService.contarDesistimientos(
      pIdEtapa,
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // LEADS ATENDIDOS / SIN ATENDER
  // =========================================================
  @Get('leads-atendidos')
  @UseGuards(JwtAuthGuard)
  contarLeadsAtendidos(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    const {
      fechaInicio: pFechaInicio,
      fechaFin: pFechaFin,
    } = this.obtenerRangoFechas(
      fechaInicio,
      fechaFin,
    );

    return this.dashboardService.contarLeadsAtendidos(
      pFechaInicio,
      pFechaFin,
    );
  }
}