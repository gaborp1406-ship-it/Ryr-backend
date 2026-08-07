import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { OpcionesService } from './opciones.service';
@Controller('opciones')
export class OpcionesController {
  constructor(private readonly opcionesService: OpcionesService) {}

  @Get('listar/:id')
  @UseGuards(JwtAuthGuard)
  listarOpciones(@Param('id', new ParseIntPipe()) id: number) {
    return this.opcionesService.listarOpciones(id);
  }
}
