import { Module } from '@nestjs/common';
import { LeadController } from './leads.controller';
import { LeadService } from './leads.service';
import { LeadRepository } from './repository/lead.repository';
import { SupabaseProvider } from './supabase.provider';


@Module({
  controllers: [LeadController],
  providers: [LeadService, LeadRepository, SupabaseProvider],
})
export class LeadsModule { }
