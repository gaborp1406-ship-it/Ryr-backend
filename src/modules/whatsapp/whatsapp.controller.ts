// whatsapp.controller.ts
import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    Logger,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import {
   type CompletarOnboardingDto,
    WhatsappCoexistenciaService,
} from './whatsapp.coexistencia';

@Controller('whatsapp')
export class WhatsappController {
    private readonly logger = new Logger(WhatsappController.name);

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly coexistencia: WhatsappCoexistenciaService,
    ) { }

    // ═════════ Webhook (Meta) ═════════

    @Get('webhook')
    verificarWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return challenge;
        }
        throw new ForbiddenException('Token de verificación inválido.');
    }

    @Post('webhook')
    @HttpCode(200)
    recibirWebhook(@Body() body: any) {
        // Respondemos 200 de inmediato y procesamos en segundo plano (evita reintentos de Meta)
        void this.whatsappService
            .procesarWebhook(body)
            .catch((e) => this.logger.error(`Webhook: ${(e as Error).message}`));
        return 'EVENT_RECEIVED';
    }

    // ═════════ Coexistencia ═════════

    /** 1) Registrar el número del asesor (antes del onboarding) */
    @Post('coexistencia/asesor')
    registrarAsesor(@Body() dto: { id_trabajador: number; numero: string }) {
        return this.coexistencia.registrarAsesor(dto.id_trabajador, dto.numero);
    }

    /** 2) Completar onboarding (el front manda el code de Embedded Signup) */
    @Post('coexistencia/onboarding')
    completarOnboarding(@Body() dto: CompletarOnboardingDto) {
        return this.coexistencia.completarOnboarding(dto);
    }

    /** 3) Ver el estado de conexión de un asesor (sin exponer el token) */
    @Get('coexistencia/asesor/:idTrabajador')
    estadoAsesor(@Param('idTrabajador', ParseIntPipe) idTrabajador: number) {
        return this.coexistencia.estadoAsesor(idTrabajador);
    }

    // ═════════ Chat del CRM ═════════

    @Get('leads/:idLead/mensajes')
    listar(@Param('idLead', ParseIntPipe) idLead: number) {
        return this.whatsappService.listarMensajes(idLead);
    }

    @Post('leads/enviar')
    enviar(@Body() dto: { id_lead: number; mensaje: string }) {
        return this.whatsappService.enviarMensaje(Number(dto.id_lead), dto.mensaje);
    }

    @Post('leads/:idLead/indicador')
    indicador(
        @Param('idLead', ParseIntPipe) idLead: number,
        @Body() dto: { escribiendo?: boolean },
    ) {
        return this.whatsappService.indicadorCliente(idLead, !!dto?.escribiendo);
    }
}