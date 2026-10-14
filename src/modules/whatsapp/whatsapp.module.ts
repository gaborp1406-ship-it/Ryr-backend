// whatsapp.module.ts
import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappCoexistenciaService } from './whatsapp.coexistencia';
import { WhatsappDatosService } from './whatsapp-datos.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappPruebaController } from './whatsapp-prueba.controller';

@Module({
    controllers: [WhatsappController, WhatsappPruebaController],
    providers: [
        WhatsappService,
        WhatsappCoexistenciaService,
        WhatsappDatosService,
        WhatsappGateway,
    ],
    exports: [WhatsappService, WhatsappCoexistenciaService],
})
export class WhatsappModule { }