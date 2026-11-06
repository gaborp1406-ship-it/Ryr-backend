import { Module } from '@nestjs/common';
import { AnalistadatosController } from './analistadatos.controller';
import { AnalistadatosService } from './analistadatos.service';
import { DashboardRepository } from '../dashboard/repository/dashboard.repository';

@Module({
  controllers: [AnalistadatosController],
  // DashboardRepository solo necesita DataSource (global con TypeORM),
  // así no modificamos tu DashboardModule.
  providers: [AnalistadatosService, DashboardRepository],
})
export class AnalistadatosModule { }