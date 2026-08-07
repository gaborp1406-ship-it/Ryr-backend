import { Module } from '@nestjs/common';
import { OpcionesController } from './opciones.controller';
import { OpcionesService } from './opciones.service';
import { OpcionesRepository } from './repository/opciones.repository';

@Module({
  controllers: [OpcionesController],
  providers: [OpcionesService, OpcionesRepository],
})
export class OpcionesModule {}
