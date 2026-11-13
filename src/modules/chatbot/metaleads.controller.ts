import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Logger,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request, Response } from 'express';
import { MetaLeadsService } from './metaleads.service';

/**
 * Webhook de Meta para formularios de anuncios (leadgen).
 * URL a registrar en Meta: https://TU-DOMINIO/meta-leads/webhook  (con tu prefijo global si lo usas, ej. /api)
 */
@Controller('meta-leads')
export class MetaLeadsController {
    private readonly logger = new Logger(MetaLeadsController.name);

    constructor(private readonly leads: MetaLeadsService) { }

    /** Verificación que hace Meta al guardar el webhook */
    @Get('webhook')
    verificar(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response,
    ) {
        const ok = this.leads.tokenValido(mode, token);
        this.logger.log(`Verificación de Meta: mode=${mode} tokenCoincide=${ok} envTokenDefinido=${!!process.env.META_VERIFY_TOKEN}`);
        if (ok) return res.status(200).type('text/plain').send(challenge);
        return res.sendStatus(403);
    }

    /** Meta avisa de cada lead nuevo; se responde 200 enseguida y se procesa aparte */
    @Post('webhook')
    @HttpCode(200)
    recibir(
        @Req() req: RawBodyRequest<Request>,
        @Body() body: any,
        @Headers('x-hub-signature-256') firma?: string,
    ) {
        if (!this.leads.firmaValida(req.rawBody, firma)) {
            throw new UnauthorizedException('Firma inválida');
        }
        void this.leads.procesarWebhook(body);
        return 'EVENT_RECEIVED';
    }
}