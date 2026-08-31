import { Controller, Get, Patch, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get(':idAsesor')
  listar(@Param('idAsesor', ParseIntPipe) idAsesor: number) {
    return this.notificacionesService.listar(idAsesor);
  }

  @Patch(':id/leida')
  marcarLeida(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.marcarLeida(id);
  }

  @Patch('asesor/:idAsesor/leer-todas')
  marcarTodasLeidas(@Param('idAsesor', ParseIntPipe) idAsesor: number) {
    return this.notificacionesService.marcarTodasLeidas(idAsesor);
  }

   @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.eliminar(id);
  }

  @Delete('asesor/:idAsesor/leidas')
  eliminarTodasLeidas(@Param('idAsesor', ParseIntPipe) idAsesor: number) {
    return this.notificacionesService.eliminarTodasLeidas(idAsesor);
  }
}