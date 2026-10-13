// trabajador.module.ts
import { Module } from '@nestjs/common';
import { TrabajadorController } from './trabajador.controller';
import { TrabajadorService } from './trabajador.service';
import { TrabajadorRepository } from './repository/trabajador.repository';
import { LeadsModule } from '../leads/leads.module'; // ajusta la ruta

@Module({
  imports: [LeadsModule], // 👈 nuevo
  controllers: [TrabajadorController],
  providers: [TrabajadorService, TrabajadorRepository],
})
export class TrabajadorModule {}