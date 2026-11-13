import { Module, forwardRef } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { BotModule } from '../chatbot/bot.module';

@Module({
    imports: [
        forwardRef(() => BotModule),
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