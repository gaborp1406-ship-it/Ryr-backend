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

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(fechaLimpia)) {
      throw new BadRequestException(
        `Fecha inválida: ${fecha}. Use el formato YYYY-MM-DD`,
      );
    }

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

    return this.dashboardService.contarActividades(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // DESISTIMIENTOS
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

  // =========================================================
  // 1. LEADS EN CIERRE
  // =========================================================
  @Get('leads-cierre')
  @UseGuards(JwtAuthGuard)
  contarLeadsCierre(
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

    return this.dashboardService.contarLeadsCierre(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // 2. TOTAL DE LEADS
  // =========================================================
  @Get('total-leads')
  @UseGuards(JwtAuthGuard)
  contarTotalLeads(
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

    return this.dashboardService.contarTotalLeads(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // 3. CIERRES POR PROYECTO
  // =========================================================
  @Get('cierres-por-proyecto')
  @UseGuards(JwtAuthGuard)
  contarCierresPorProyecto(
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

    return this.dashboardService.contarCierresPorProyecto(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // 4. CIERRES POR FUENTE
  // =========================================================
  @Get('cierres-por-fuente')
  @UseGuards(JwtAuthGuard)
  contarCierresPorFuente(
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

    return this.dashboardService.contarCierresPorFuente(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // 5. CIERRES POR ASESOR
  // =========================================================
  @Get('cierres-por-asesor')
  @UseGuards(JwtAuthGuard)
  contarCierresPorAsesor(
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

    return this.dashboardService.contarCierresPorAsesor(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // 6. TOTAL DE LEADS POR FUENTE
  // =========================================================
  @Get('total-leads-por-fuente')
  @UseGuards(JwtAuthGuard)
  contarTotalLeadsPorFuente(
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

    return this.dashboardService.contarTotalLeadsPorFuente(
      pFechaInicio,
      pFechaFin,
    );
  }

  // =========================================================
  // 7. TASA DE CIERRE
  // =========================================================
  @Get('tasa-cierre')
  @UseGuards(JwtAuthGuard)
  contarTasaCierre(
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

    return this.dashboardService.contarTasaCierre(
      pFechaInicio,
      pFechaFin,
    );
  }

  @Get('leads-negociacion')
  @UseGuards(JwtAuthGuard)
  contarLeadsNegociacion(
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

    return this.dashboardService.contarLeadsNegociacion(
      pFechaInicio,
      pFechaFin,
    );
  }

  @Get('negociacion-por-fuente')
  @UseGuards(JwtAuthGuard)
  contarNegociacionPorFuente(
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

    return this.dashboardService.contarNegociacionPorFuente(
      pFechaInicio,
      pFechaFin,
    );
  }

  @Get('negociacion-por-proyecto')
  @UseGuards(JwtAuthGuard)
  contarNegociacionPorProyecto(
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

    return this.dashboardService.contarNegociacionPorProyecto(
      pFechaInicio,
      pFechaFin,
    );
  }

  @Get('negociacion-por-asesor')
  @UseGuards(JwtAuthGuard)
  contarNegociacionPorAsesor(
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

    return this.dashboardService.contarNegociacionPorAsesor(
      pFechaInicio,
      pFechaFin,
    );
  }

  @Get('listar-leads-negociacion')
  @UseGuards(JwtAuthGuard)
  listarLeadsNegociacion(
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

    return this.dashboardService.listarLeadsNegociacion(
      pFechaInicio,
      pFechaFin,
    );
  }

  @Get('contacto-por-asesor')
  @UseGuards(JwtAuthGuard)
  contactoPorAsesor(
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

    return this.dashboardService.contactoPorAsesor(
      pFechaInicio,
      pFechaFin,
    );
  }


  @Get('rangos-contacto')
  @UseGuards(JwtAuthGuard)
  rangosContacto(
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

    return this.dashboardService.rangosContacto(
      pFechaInicio,
      pFechaFin,
    );
  }


  @Get('resumen-contacto')
  @UseGuards(JwtAuthGuard)
  resumenContacto(
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

    return this.dashboardService.resumenContacto(
      pFechaInicio,
      pFechaFin,
    );
  }


  @Get('leads-contactados-asesor')
  @UseGuards(JwtAuthGuard)
  leadsContactadosAsesor(
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

    return this.dashboardService.leadsContactadosAsesor(
      pFechaInicio,
      pFechaFin,
    );
  }
}