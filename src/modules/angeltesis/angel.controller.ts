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

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AngelService } from './angel.service';

@Controller('trabajador')
export class AngelController {
  constructor(private readonly AngelService: AngelService) {}



  @Get('estados-conexion')
  @UseGuards(JwtAuthGuard)
  listarEstadosConexion() {
    return this.AngelService.listarEstadosConexion();
  }

}