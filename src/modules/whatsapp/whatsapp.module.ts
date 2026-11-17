import { Module, forwardRef } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { BotModule } from '../chatbot/bot.module';
import { CampaniaMasivaModule } from '../campaniamasiva/campaniamasiva.module';

@Module({
    imports: [
        forwardRef(() => BotModule),
        CampaniaMasivaModule,
    ],
    controllers: [WhatsappController],
    providers: [
        WhatsappService,
    ],
    exports: [
        WhatsappService,
    ],
})
export class WhatsappModule {}