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
import { TrabajadorRequestDto } from './dto/trabajador-request.dto';
import { ListTrabajadoresDTO } from './dto/list-trabajador.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
@Controller('trabajador')
export class TrabajadorController {
  constructor(private readonly TrabajadorService: TrabajadorService) {}

  @Post('registrar')
  @UseGuards(JwtAuthGuard)
  registrarTrabajador(@Body() data: TrabajadorRequestDto) {
    return this.TrabajadorService.registrarTrabajador(data);
  }

  //Servicio que se ejecuta antes de hacer una llamada
  @Post('obtener-estado-trabajador')
  @UseGuards(JwtAuthGuard)
  obtenerEstadoTrabajador(@Body() data: TrabajadorRequestDto) {
    return this.TrabajadorService.obtenerEstadoConexionAgente(data);
  }

  @Get('listar-trabajadores-agentes')
  @UseGuards(JwtAuthGuard)
  listarTrabajadoresAgentes(@Query() data: ListTrabajadoresDTO) {
    return this.TrabajadorService.listarTrabajadoresAgentes(data);
  }

  @Post('cambiar-estado-conexion')
  @UseGuards(JwtAuthGuard)
  cambiarEstadoConexionAgente(@Body() data: TrabajadorRequestDto) {
    return this.TrabajadorService.cambiarEstadoConexionAgente(data);
  }

  @Get('listar-roles')
  @UseGuards(JwtAuthGuard)
  listarRoles(
    @Query('id_rol', new ParseIntPipe({ optional: true })) id_rol?: number,
  ) {
    return this.TrabajadorService.listadoRoles(id_rol);
  }

  @Get('obtener-trabajador/:id')
  @UseGuards(JwtAuthGuard)
  obtenerTrabajador(@Param('id', new ParseIntPipe()) id: number) {
    return this.TrabajadorService.obtenerTrabajador(id);
  }

  @Get('listar-estados-conexion')
  @UseGuards(JwtAuthGuard)
  listarEstadosConexion(
    @Param('id_estado_conexion', new ParseIntPipe({ optional: true }))
    id_estado_conexion?: number,
  ) {
    return this.TrabajadorService.listadoEstadosConexion(id_estado_conexion);
  }

  @Get('obtener-trabajador-campania/:id')
  @UseGuards(JwtAuthGuard)
  obtenerTrabajadorPorCamapania(@Param('id', new ParseIntPipe()) id: number) {
    return this.TrabajadorService.obtenerTrabajadoresPorCampania(id);
  }
}
