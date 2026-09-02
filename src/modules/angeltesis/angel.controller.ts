import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';


import { AngelService } from './angel.service';

import { CrearOrdenDto } from './dto/crear-orden.dto';

import { CrearOrdenNombresDto } from './dto/crear-orden-nombres.dto';

@Controller('angel')
export class AngelController {
  constructor(
    private readonly AngelService: AngelService,
  ) {}

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

  // ==========================================================
  // CREAR ORDEN POR NOMBRES
  // ==========================================================

  @Post('orden/nombres')

  crearOrdenPorNombres(
    @Body() body: CrearOrdenNombresDto,
  ) {
    return this.AngelService.crearOrdenPorNombres(body);
  }
}