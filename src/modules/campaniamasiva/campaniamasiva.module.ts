// campaniamasiva.module.ts
import { Module } from '@nestjs/common';
import { CampaniaMasivaController } from './campaniamasiva.controller';
import { CampaniaMasivaService } from './campaniamasiva.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
    controllers: [CampaniaMasivaController],
    providers: [CampaniaMasivaService, CloudinaryService],
    exports: [CampaniaMasivaService], // para que WhatsappModule lo use en el webhook
})
export class CampaniaMasivaModule { }