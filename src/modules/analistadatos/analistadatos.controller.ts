import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AnalistadatosService } from './analistadatos.service';

export interface ChatAnalistaBody {
  mensaje: string;
  /** Filtros actuales del dashboard (YYYY-MM-DD). Opcionales. */
  fecha_inicio?: string;
  fecha_fin?: string;
  id_asesor?: number | string;
  /** Mensajes anteriores de la conversación (opcional, el front los reenvía) */
  historial?: { role: 'user' | 'assistant'; content: string }[];
}

@Controller('analista-datos')
export class AnalistadatosController {
  constructor(private readonly service: AnalistadatosService) { }

  @Post('chat')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  chat(@Body() body: ChatAnalistaBody) {
    return this.service.chat(body);
  }
}