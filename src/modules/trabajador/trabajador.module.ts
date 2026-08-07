import { Module } from '@nestjs/common';
import { TrabajadorController } from './trabajador.controller';
import { TrabajadorService } from './trabajador.service';
import { TrabajadorRepository } from './repository/trabajador.repository';

@Module({
  controllers: [TrabajadorController],
  providers: [TrabajadorService, TrabajadorRepository],
})
export class TrabajadorModule {}
