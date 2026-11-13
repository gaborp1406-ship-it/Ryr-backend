import { Module, forwardRef } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { BotWaService } from './botwaservice';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { LeadsModule } from '../leads/leads.module';
import { MetaLeadsController } from './metaleads.controller';
import { MetaLeadsService } from './metaleads.service';

@Module({
    imports: [
        forwardRef(() => WhatsappModule),
        LeadsModule,
    ],
    controllers: [BotController, MetaLeadsController],
    providers: [
        BotService,
        BotWaService,
        MetaLeadsService
    ],
    exports: [
        BotService,
        BotWaService,
    ],
})
export class BotModule {}