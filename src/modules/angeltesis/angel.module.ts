import { Module } from '@nestjs/common';
import { AngelController } from './angel.controller';
import { AngelService  } from './angel.service';
import { AngelRepository } from './repository/trabajador.repository';

@Module({
  controllers: [AngelController],
  providers: [AngelService, AngelRepository],
})
export class AngelModule {}
