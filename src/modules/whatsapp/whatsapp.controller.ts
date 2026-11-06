// whatsapp.controller.ts
import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Headers,
    HttpCode,
    Logger,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { RawBodyRequest } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import type { ArchivoSubido } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
    private readonly logger = new Logger(WhatsappController.name);

    constructor(
        private readonly whatsappService: WhatsappService,
    ) { }

    // ───────────── WEBHOOK (público: NO le pongas guard de autenticación) ─────────────

    /** Meta llama a este endpoint una sola vez al configurar el webhook */
    @Get('webhook')
    verificarWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
            return challenge;
        }
        throw new ForbiddenException('Token de verificación inválido');
    }

    /** Aquí llegan los mensajes entrantes y los estados (enviado/entregado/leído) */
    @Post('webhook')
    @HttpCode(200)
    recibirWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('x-hub-signature-256') firma: string,
        @Body() body: any,
    ) {
        this.validarFirma(req.rawBody, firma);

        // Respondemos rápido a Meta y procesamos en segundo plano
        this.whatsappService.procesarWebhook(body).catch((e) =>
            this.logger.error(`Error en webhook: ${e.message}`, e.stack),
        );
        return 'EVENT_RECEIVED';
    }

    /** Verifica que el request realmente venga de Meta (requiere WA_APP_SECRET) */
    private validarFirma(rawBody: Buffer | undefined, firma?: string) {
        const secret = process.env.WA_APP_SECRET;
        if (!secret) return; // si no lo configuras, no valida (útil solo en desarrollo)
        if (!rawBody || !firma) throw new ForbiddenException('Firma ausente');

        const esperada = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
        const a = Buffer.from(firma);
        const b = Buffer.from(esperada);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
            throw new ForbiddenException('Firma inválida');
        }
    }

    // ───────────── CHAT DENTRO DEL LEAD (protégelos con tu guard/JWT) ─────────────

    /** Conversación completa del lead + si la ventana de 24h está abierta */
    @Get('leads/:idLead/mensajes')
    obtenerConversacion(
        @Param('idLead', ParseIntPipe) idLead: number,
        @Query('limite') limite?: string,
    ) {
        return this.whatsappService.obtenerConversacion(idLead, limite ? Number(limite) : 200);
    }

    /** El asesor escribe desde el CRM */
    @Post('leads/:idLead/mensajes')
    enviarTexto(
        @Param('idLead', ParseIntPipe) idLead: number,
        @Body('texto') texto: string,
        @Req() req: any,
    ) {
        const usuario = req.user?.id; // <- ajusta a cómo guardas el usuario en tu JWT
        return this.whatsappService.enviarTexto(idLead, texto, usuario);
    }

    /** Plantilla aprobada (para iniciar conversación o pasadas las 24h) */
    @Post('leads/:idLead/plantilla')
    enviarPlantilla(
        @Param('idLead', ParseIntPipe) idLead: number,
        @Body() dto: { nombre: string; idioma?: string; parametros?: string[] },
        @Req() req: any,
    ) {
        if (!dto?.nombre) throw new BadRequestException('Falta el nombre de la plantilla');
        const usuario = req.user?.id;
        return this.whatsappService.enviarPlantilla(
            idLead, dto.nombre, dto.idioma ?? 'es', dto.parametros ?? [], usuario,
        );
    }

    /** Saludo con un clic: cliente, asesor y empresa se toman del lead */
    @Post('leads/:idLead/saludo')
    enviarSaludo(
        @Param('idLead', ParseIntPipe) idLead: number,
        @Req() req: any,
    ) {
        const usuario = req.user?.id;
        return this.whatsappService.enviarSaludo(idLead, usuario);
    }

    /** Envía una imagen, video o documento en medio del chat (multipart: campo "archivo" + "caption" opcional) */
    @Post('leads/:idLead/archivo')
    @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: 25 * 1024 * 1024 } }))
    enviarArchivo(
        @Param('idLead', ParseIntPipe) idLead: number,
        @UploadedFile() archivo: ArchivoSubido,
        @Body('caption') caption: string,
        @Req() req: any,
    ) {
        if (!archivo) throw new BadRequestException('Adjunta un archivo en el campo "archivo"');

        // multer decodifica los nombres como latin1: se corrigen tildes y ñ
        const nombre = /[^\u0000-\u00ff]/.test(archivo.originalname)
            ? archivo.originalname
            : Buffer.from(archivo.originalname, 'latin1').toString('utf8');

        const usuario = req.user?.id;
        return this.whatsappService.enviarArchivo(idLead, { ...archivo, originalname: nombre }, caption, usuario);
    }

    /** Devuelve el archivo de un mensaje para mostrarlo o descargarlo en el chat */
    @Get('mensajes/:idMensaje/archivo')
    async descargarArchivo(
        @Param('idMensaje', ParseIntPipe) idMensaje: number,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { stream, mime, nombre } = await this.whatsappService.obtenerArchivo(idMensaje);
        res.set({
            'Content-Type': mime,
            'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(nombre)}`,
        });
        return new StreamableFile(stream);
    }
}