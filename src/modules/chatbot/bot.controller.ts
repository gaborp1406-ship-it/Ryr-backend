import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Headers,
    HttpCode,
    Param,
    Post,
} from '@nestjs/common';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
    constructor(private readonly botService: BotService) { }

    /** Si defines BOT_API_KEY en el .env, hay que enviarla en el header x-bot-key */
    private validarLlave(llave?: string) {
        const esperada = process.env.BOT_API_KEY;
        if (esperada && llave !== esperada) throw new ForbiddenException('Llave inválida');
    }

    /**
     * Llega un mensaje del lead y devuelve la secuencia de mensajes que el bot le enviaría.
     * `proyecto` es opcional: el proyecto del anuncio por el que llegó el lead.
     */
    @Post('mensaje')
    @HttpCode(200)
    mensaje(
        @Body() body: { telefono: string; texto: string; proyecto?: string },
        @Headers('x-bot-key') llave?: string,
    ) {
        this.validarLlave(llave);
        return this.botService.procesarMensaje(body?.telefono, body?.texto, body?.proyecto);
    }

    /** Ver en qué paso va una conversación */
    @Get('sesion/:telefono')
    verSesion(@Param('telefono') telefono: string, @Headers('x-bot-key') llave?: string) {
        this.validarLlave(llave);
        return this.botService.verSesion(telefono);
    }

    /** Borra la sesión de un teléfono para volver a probar desde cero */
    @Post('reiniciar')
    @HttpCode(200)
    reiniciar(@Body() body: { telefono: string }, @Headers('x-bot-key') llave?: string) {
        this.validarLlave(llave);
        return this.botService.reiniciar(body?.telefono);
    }
}