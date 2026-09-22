import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Controller('trabajador')
export class TrabajadorController {
  constructor(private readonly TrabajadorService: TrabajadorService) {}



  @Get('estados-conexion')
  @UseGuards(JwtAuthGuard)
  listarEstadosConexion() {
    return this.TrabajadorService.listarEstadosConexion();
  }

  @Get(':id/estado-actual')
  @UseGuards(JwtAuthGuard)
  obtenerEstadoActual(@Param('id', ParseIntPipe) id: number) {
    return this.TrabajadorService.obtenerEstadoActual(id);
  }

  @Post('estado/cambiar')
  @UseGuards(JwtAuthGuard)
  cambiarEstado(@Body() data: CambiarEstadoDto) {
    return this.TrabajadorService.cambiarEstado(
      data.id_trabajador,
      data.id_estado,
    );
  }

  @Get('estado-actual')
  @UseGuards(JwtAuthGuard)
  listarEstadoActualTrabajadores(
    @Query('id_estado') id_estado?: string,
  ) {
    return this.TrabajadorService.listarEstadoActualTrabajadores(
      id_estado ? Number(id_estado) : undefined,
    );
  }

@Get('historial-estado')
@UseGuards(JwtAuthGuard)
historialEstadoTrabajador(
  @Query('id_trabajador') id_trabajador?: string,
  @Query('id_estado') id_estado?: string,
  @Query('fecha_desde') fecha_desde?: string,
  @Query('fecha_hasta') fecha_hasta?: string,
) {
  return this.TrabajadorService.historialEstadoTrabajador(
    id_trabajador ? Number(id_trabajador) : undefined,
    id_estado ? Number(id_estado) : undefined,
    fecha_desde,
    fecha_hasta,
  );
}
}