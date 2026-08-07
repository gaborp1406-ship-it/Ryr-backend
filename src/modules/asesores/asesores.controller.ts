import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AsesoresService } from './asesores.service';

@Controller('asesor')
export class AsesoresController {
  constructor(private readonly asesoresService: AsesoresService) {}

  @Get('listar/:id_trabajador')
  @UseGuards(JwtAuthGuard)
  listarAsesorDisponible(
    @Param('id_trabajador', ParseIntPipe) id_trabajador: number,
  ) {
    return this.asesoresService.listarAsesorDisponible(id_trabajador);
  }

  @Get('listar-asesores')
  @UseGuards(JwtAuthGuard)
  listarAsesores() {
    return this.asesoresService.listarAsesores();
  }
}