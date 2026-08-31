import { Module } from "@nestjs/common";
import { NotificacionesController } from "./notificaciones.controller";
import { NotificacionesGateway } from "./notificaciones.gateway";
import { NotificacionesRepository } from "./notificaciones.repository";
import { NotificacionesService } from "./notificaciones.service";

@Module({
  controllers: [NotificacionesController],
  providers: [
    NotificacionesGateway,
    NotificacionesService,
    NotificacionesRepository,
 
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}