import { Module } from '@nestjs/common';
import { AsesoresController } from './asesores.controller';
import { AsesoresRepository } from './repository/asesores.repository';
import { AsesoresService } from './asesores.service';


@Module({
  controllers: [AsesoresController],
  providers: [AsesoresService, AsesoresRepository],
})
export class AsesoresModule {}
