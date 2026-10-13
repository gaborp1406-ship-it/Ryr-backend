// leads.module.ts
import { Module } from '@nestjs/common';
import { LeadController } from './leads.controller';
import { LeadService } from './leads.service';
import { LeadRepository } from './repository/lead.repository';
import { SupabaseProvider } from './supabase.provider';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [LeadController],
  providers: [LeadService, LeadRepository, SupabaseProvider],
  exports: [LeadService], // 👈 nuevo: permite que otros módulos lo usen
})
export class LeadsModule {}