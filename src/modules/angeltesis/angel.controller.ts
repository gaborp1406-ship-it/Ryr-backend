import {
  Body,
  Controller,
  Post,
  Get,

  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';


import { AngelService } from './angel.service';

import { CrearOrdenDto } from './dto/crear-orden.dto';
import { CrearDatosRealesDto } from './dto/CrearDatosRealesDto';

@Controller('angel')
export class AngelController {
  constructor(
    private readonly AngelService: AngelService,
  ) { }

  // ==========================================================
  // LISTAR MATERIALES
  // ==========================================================

  @Get('materiales')

  listarMateriales() {
    return this.AngelService.listarMateriales();
  }

  // ==========================================================
  // LISTAR RIESGOS
  // ==========================================================

  @Get('riesgos')

  listarRiesgos() {
    return this.AngelService.listarRiesgos();
  }
  @Get('ordenes')

  listarOrdenes(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    return this.AngelService.listarOrdenes(
      fechaInicio,
      fechaFin,
    );
  }

  // ==========================================================
  // CREAR ORDEN CON IDS
  // ==========================================================

  @Post('orden')

  crearOrden(
    @Body() body: CrearOrdenDto,
  ) {
    return this.AngelService.crearOrden(body);
  }

  @Post('orden/datos-reales')
  crearDatosReales(
    @Body() body: CrearDatosRealesDto,
  ) {
    return this.AngelService.crearDatosReales(body);
  }
  @Get('dashboard')
  obtenerDashboard() {
    return this.AngelService.obtenerDashboard();
  }
  // ==========================================================
  // OBTENER DETALLE + INDICADORES DE UNA ORDEN
  // ==========================================================
  @Get('orden/indicadores/:idOrden')
  obtenerDetalleOrdenIndicadores(
    @Param('idOrden') idOrden: string,
  ) {
    return this.AngelService.obtenerDetalleOrdenIndicadores(
      Number(idOrden),
    );
  }
  @Post('ordenes/:id/analisis-ml')
  async guardarAnalisisMl(
    @Param('id', ParseIntPipe) idOrden: number,
    @Body()
    data: {
      mano_obra: number;
      version_modelo?: string;
      materiales: {
        material: string;
        cantidad?: number | null;
        unidad?: string | null;
        probabilidad?: number | null;
      }[];
      riesgos: {
        riesgo: string;
        probabilidad?: number | null;
      }[];
    },
  ) {
    return await this.AngelService.guardarAnalisisMl({
      id_orden: idOrden,
      mano_obra: data.mano_obra,
      version_modelo: data.version_modelo,
      materiales: data.materiales,
      riesgos: data.riesgos,
    });
  }

}