import { Module } from '@nestjs/common';
import { AriService } from './ari.service';
import { AriController } from './ari.controller';
import { ColaRepository } from './repository/cola.repository';
import { GrabacionesRepository } from './repository/grabaciones.repository';
import { LlamadasRepository } from './repository/llamadas.repository';
import { MarcadorRepository } from './repository/marcador.repository';

@Module({
  controllers: [AriController],
  providers: [
    AriService,
    ColaRepository,
    GrabacionesRepository,
    LlamadasRepository,
    MarcadorRepository,
  ],
})
export class AriModule {}
