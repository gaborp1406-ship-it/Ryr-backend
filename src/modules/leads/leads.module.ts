import { Module } from '@nestjs/common';
import { LeadController } from './leads.controller';
import { LeadService } from './leads.service';
import { LeadRepository } from './repository/lead.repository';
import { SupabaseProvider } from './supabase.provider';
import { NotificacionesModule } from '../notificaciones/notificaciones.module'; // 👈 importa el módulo

@Module({
  imports: [NotificacionesModule], // 👈 aquí, no en providers
  controllers: [LeadController],
  providers: [
    LeadService,
    LeadRepository,
    SupabaseProvider,
    // NotificacionesService ya NO va aquí
  ],
})
export class LeadsModule {}