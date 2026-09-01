import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConsultarPrediccionDto, RespuestaPrediccion } from './prediccion.dto'; // <- SIEMPRE entre llaves { }

@Injectable()
export class PrediccionService {
  // URL del servicio Python (api_prediccion.py). Muévelo a variables
  // de entorno en producción: process.env.PREDICCION_API_URL
  private readonly baseUrl =
    process.env.PREDICCION_API_URL ?? 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  async predecir(dto: ConsultarPrediccionDto): Promise<RespuestaPrediccion> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<RespuestaPrediccion>(
          `${this.baseUrl}/predecir`,
          dto,
        ),
      );
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudo obtener la predicción. Verifica que el servicio de ML esté corriendo.',
      );
    }
  }
}
