import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrediccionController } from './prediccion.controller';
import { PrediccionService } from './prediccion.service';
import { PrediccionPythonService } from './prediccion-python.service';

@Module({
  imports: [HttpModule],
  controllers: [PrediccionController],
  // PrediccionPythonService arranca/apaga el proceso Python junto con Nest.
  providers: [PrediccionService, PrediccionPythonService],
  exports: [PrediccionService],
})
export class PrediccionModule {}
