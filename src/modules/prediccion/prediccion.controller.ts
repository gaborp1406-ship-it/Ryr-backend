import { Body, Controller, Post } from '@nestjs/common';
import { PrediccionService } from './prediccion.service';
import { ConsultarPrediccionDto, RespuestaPrediccion } from './prediccion.dto';

@Controller('prediccion')
export class PrediccionController {
  constructor(private readonly prediccionService: PrediccionService) {}

  // POST /prediccion  { "descripcion": "SRV CAMBIO DE TUBERIA DE VAPOR..." }
  @Post()
  async consultar(
    @Body() dto: ConsultarPrediccionDto,
  ): Promise<RespuestaPrediccion> {
    return this.prediccionService.predecir(dto);
  }
}
