import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AriGateway } from './asterick.gateway';
import { AriService } from './asterisk.service';
import { AriController } from './asterisk.controller';
import { AmdModule } from '../amd/amd.module';

import { CallEventsService } from './events/CallEventsService';
import { SupabaseProvider } from '../leads/supabase.provider';

@Module({
  imports: [HttpModule, AmdModule],
  controllers: [AriController],
  providers: [AriService, AriGateway, CallEventsService, SupabaseProvider],
  exports: [AriService, AriGateway, CallEventsService],
})
export class AsteriskModule {}