import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ProyectosService } from './proyectos.service';
@Controller('proyecto')
export class ProyectosController {
  constructor(private readonly proyectoService: ProyectosService) {}

  @Get('listar/:id')
  @UseGuards(JwtAuthGuard)
  listarOpciones(@Param('id', new ParseIntPipe()) id: number) {
    return this.proyectoService.listarProyectos(id);
  }
}
