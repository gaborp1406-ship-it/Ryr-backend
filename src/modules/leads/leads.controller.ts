import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Param
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LeadService } from './leads.service';
import type { ICrearLead, IListarClientesPotenciales } from './interface/leads.interface';
@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) { }

  @Get('listar-diario/:id_trabajador')
  @UseGuards(JwtAuthGuard)
  listarAsesorDisponible(
    @Param('id_trabajador', ParseIntPipe) id_trabajador: number,
  ) {
    return this.leadService.listarleadsdiarios(id_trabajador);
  }

  @Post('crear')
  @UseGuards(JwtAuthGuard)
  crearLead(
    @Body() data: ICrearLead
  ) {

    return this.leadService.crearLead(data);

  }
  @Get('detalle/:id_lead')
  @UseGuards(JwtAuthGuard)
  obtenerDetalleLead(
    @Param('id_lead', ParseIntPipe) id_lead: number,
  ) {
    return this.leadService.obtenerDetalleLead(id_lead);
  }
  @Post('listar-clientes-potenciales')
  @UseGuards(JwtAuthGuard)
  listarClientesPotenciales(
    @Body() data: IListarClientesPotenciales,
  ) {
    return this.leadService.listarClientesPotenciales(data);
  }

  @Get('obtener-etapa-actual/:id_lead')
  @UseGuards(JwtAuthGuard)
  obtenerEtapaActualLead(
    @Param('id_lead', ParseIntPipe) id_lead: number,
  ) {
    return this.leadService.obtenerEtapaActualLead(id_lead);
  }

  @Post('finalizar-etapa/:id_lead_etapa')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaLead(
    @Param('id_lead_etapa', ParseIntPipe) id_lead_etapa: number,
  ) {
    return this.leadService.finalizarEtapaLeadAsignacion(id_lead_etapa);
  }

  @Get('info-estado-contacto/:id_lead')
  @UseGuards(JwtAuthGuard)
  obtenerEstadoContactoLead(
    @Param('id_lead', ParseIntPipe) id_lead: number,
  ) {
    return this.leadService.obtenerEstadoContactoLead(id_lead);
  }

  @Get('historial-correo/:id_estado_contacto')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialCorreo(
    @Param('id_estado_contacto', ParseIntPipe)
    id_estado_contacto: number,
  ) {
    return this.leadService.obtenerHistorialCorreo(
      id_estado_contacto,
    );
  }

  @Get('historial-whatsapp/:id_estado_contacto')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialWhatsapp(
    @Param('id_estado_contacto', ParseIntPipe)
    id_estado_contacto: number,
  ) {
    return this.leadService.obtenerHistorialWhatsapp(
      id_estado_contacto,
    );
  }

  @Get('historial-llamadas/:id_estado_contacto')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialLlamadas(
    @Param('id_estado_contacto', ParseIntPipe)
    id_estado_contacto: number,
  ) {
    return this.leadService.obtenerHistorialLlamadas(
      id_estado_contacto,
    );
  }

  @Post('registrar-whatsapp')
  @UseGuards(JwtAuthGuard)
  registrarWhatsapp(
    @Body() data: {
      id_estado_contacto: number;
      url_evidencia: string;
      mensaje?: string;
    },
  ) {
    return this.leadService.registrarWhatsapp(data);
  }


  @Post('registrar-correo')
  @UseGuards(JwtAuthGuard)
  registrarCorreo(
    @Body() data: {
      id_estado_contacto: number;
      url_evidencia: string;
      mensaje?: string;
    },
  ) {
    return this.leadService.registrarCorreo(data);
  }


  @Post('registrar-llamada')
  @UseGuards(JwtAuthGuard)
  registrarLlamada(
    @Body() data: {
      id_estado_contacto: number;
      fecha_inicio: string;
      fecha_fin?: string;
      duracion_segundos?: number;
      contestada?: boolean;
      grabacion_url?: string;
      observacion?: string;
    },
  ) {
    return this.leadService.registrarLlamada(data);
  }
  @Post('finalizar-etapa-contacto-desistio')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaContactoDesistio(
    @Body() data: {
      id_lead: number;
      motivo?: number;
    },
  ) {

    return this.leadService.finalizarEtapaContactoDesistio(data);

  }
  @Get('info-desistio-lead/:idLead')
  @UseGuards(JwtAuthGuard)
  obtenerInfoDesistioLead(
    @Param('idLead', ParseIntPipe) idLead: number,
  ) {

    return this.leadService.obtenerInfoDesistioLead(idLead);

  }

  @Post('agendar-reunion')
  @UseGuards(JwtAuthGuard)
  agendarReunion(
    @Body() body: {
      idAsesor: number;
      idLead: number;
      idTipoActividad: number;
      titulo: string;
      descripcion: string;
      fecha: string;
      hora: string;
      idUsuarioCreacion: number;
    },
  ) {

    return this.leadService.agendarReunion(body);

  }

  @Post('listar-actividades-asesores')
  @UseGuards(JwtAuthGuard)
  listarActividadesAsesores(
    @Body()
    body: {
      fechaInicio?: string;
      fechaFin?: string;
      idAsesor?: number;
      idTipoActividad?: number;
      estado?: number;
    },
  ) {

    return this.leadService.listarActividadesAsesores(body);

  }
}
