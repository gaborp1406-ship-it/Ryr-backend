import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Param,
  Delete,
  Query
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

  @Post('validar-duplicado')
  @UseGuards(JwtAuthGuard)
  validarLeadDuplicado(
    @Body() data: {
      dni: string;
      telefono: string;
    }
  ) {

    return this.leadService.validarLeadDuplicado(
      data.dni,
      data.telefono
    );

  }

  @Post('editar-mensaje-lead-etapa-contacto')
  @UseGuards(JwtAuthGuard)
  editarMensajeLeadEtapaContacto(
    @Body() data: {
      id: number;
      mensaje: string;
    }
  ) {
    return this.leadService.editarMensajeLeadEtapaContacto(
      data.id,
      data.mensaje
    );
  }

  @Get('leads-por-etapa-actual')
  @UseGuards(JwtAuthGuard)
  obtenerLeadsPorEtapaActual(
    @Query('idEtapa') idEtapa?: string,
    @Query('idAgente') idAgente?: string
  ) {
    return this.leadService.obtenerLeadsPorEtapaActual(
      idEtapa ? parseInt(idEtapa, 10) : undefined,
      idAgente ? parseInt(idAgente, 10) : undefined
    );
  }

  @Post('reabrir-lead-etapa')
  @UseGuards(JwtAuthGuard)
  reabrirLeadEtapa(
    @Body('idLeadEtapa') idLeadEtapa: number
  ) {
    return this.leadService.reabrirLeadEtapa(
      idLeadEtapa
    );
  }

  @Get('listar-etapas')
  @UseGuards(JwtAuthGuard)
  listarEtapas() {
    return this.leadService.listarEtapas();
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

  @Get('registrar-primer-contacto/:id_estado_contacto')
  @UseGuards(JwtAuthGuard)
  registrarPrimerContacto(
    @Param('id_estado_contacto', ParseIntPipe) id_estado_contacto: number,
  ) {
    return this.leadService.registrarPrimerContacto(id_estado_contacto);
  }

  @Get('info-estado-reunion/:id_lead')
  @UseGuards(JwtAuthGuard)
  obtenerInfoEstadoReunionLead(
    @Param('id_lead', ParseIntPipe) id_lead: number,
  ) {
    return this.leadService.obtenerInfoEstadoReunionLead(id_lead);
  }

  @Get('historial-correo/:id_estado_contacto/:tipo_historial')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialCorreo(
    @Param('id_estado_contacto', ParseIntPipe)
    id_estado_contacto: number,

    @Param('tipo_historial', ParseIntPipe)
    tipo_historial: number,
  ) {
    return this.leadService.obtenerHistorialCorreo(
      id_estado_contacto,
      tipo_historial,
    );
  }

  @Get('historial-whatsapp/:id_estado_contacto/:tipo_historial')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialWhatsapp(
    @Param('id_estado_contacto', ParseIntPipe)
    id_estado_contacto: number,

    @Param('tipo_historial', ParseIntPipe)
    tipo_historial: number,
  ) {
    return this.leadService.obtenerHistorialWhatsapp(
      id_estado_contacto,
      tipo_historial,
    );
  }




  @Get('historial-llamadas/:id_etapa_lead/:tipo_historial')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialLlamadas(
    @Param('id_etapa_lead', ParseIntPipe)
    id_etapa_lead: number,

    @Param('tipo_historial', ParseIntPipe)
    tipo_historial: number,
  ) {
    return this.leadService.obtenerHistorialLlamadas(
      id_etapa_lead,
      tipo_historial,
    );
  }





  @Post('registrar-whatsapp')
  @UseGuards(JwtAuthGuard)
  registrarWhatsapp(
    @Body()
    data: {
      id_estado_contacto: number;
      url_evidencia: string;
      mensaje?: string;
      tipo_historial: number;
    },
  ) {
    return this.leadService.registrarWhatsapp(data);
  }

  @Post('registrar-correo')
  @UseGuards(JwtAuthGuard)
  registrarCorreo(
    @Body()
    data: {
      id_estado_contacto: number;
      url_evidencia: string;
      mensaje?: string;
      tipo_historial: number;
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


  @Post('finalizar-etapa-oportunidad-desistio')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaOportunidadDesistio(
    @Body() data: {
      id_lead: number;
      motivo?: number;
    },
  ) {
    return this.leadService.finalizarEtapaOportunidadDesistio(
      data.id_lead,
      data.motivo,
    );
  }





  @Post('finalizar-etapa-negociacion-desistio')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaNegociacionDesistio(
    @Body() data: {
      id_lead: number;
      motivo?: number;
    },
  ) {
    return this.leadService.finalizarEtapaNegociacionDesistio(
      data.id_lead,
      data.motivo,
    );
  }



  @Post('finalizar-etapa-cierre-desistio')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaCierreDesistio(
    @Body() data: {
      id_lead: number;
      motivo?: number;
    },
  ) {
    return this.leadService.finalizarEtapaCierreDesistio(
      data.id_lead,
      data.motivo,
    );
  }


  @Get('info-desistio-lead/:idLead')
  @UseGuards(JwtAuthGuard)
  obtenerInfoDesistioLead(
    @Param('idLead', ParseIntPipe) idLead: number,
  ) {

    return this.leadService.obtenerInfoDesistioLead(idLead);

  }

    @Get('info-desistio-lead-opo/:idLead')
  @UseGuards(JwtAuthGuard)
  obtenerInfoDesistioLeadOpo(
    @Param('idLead', ParseIntPipe) idLead: number,
  ) {

    return this.leadService.obtenerInfoDesistioLeadOpo(idLead);

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
      lugar_plataforma: string;

    },
  ) {

    return this.leadService.agendarReunion(body);

  }


  @Post('finalizar-etapa-negociacion/:id_lead')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaNegociacion(
    @Param('id_lead', ParseIntPipe) id_lead: number,
  ) {
    return this.leadService.finalizarEtapaNegociacion(id_lead);
  }




  @Post('finalizar-etapa-cierre/:id_lead')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaCierre(
    @Param('id_lead', ParseIntPipe) id_lead: number,
  ) {
    return this.leadService.finalizarEtapaCierre(id_lead);
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

  @Post('obtener-actividad-lead')
  @UseGuards(JwtAuthGuard)
  obtenerActividadLead(
    @Body()
    body: {
      idLead: number;
    },
  ) {
    return this.leadService.obtenerActividadLead(body.idLead);
  }

  @Post('reprogramar-actividad')
  @UseGuards(JwtAuthGuard)
  actualizarFechaHoraActividad(
    @Body()
    body: {
      idActividad: number;
      fecha: string;
      hora: string;
    },
  ) {
    return this.leadService.actualizarFechaHoraActividad(
      body.idActividad,
      body.fecha,
      body.hora,
    );
  }

  @Post('finalizar-etapa-contacto-agendarreunion')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaContactoAgendarReunion(
    @Body() data: {
      id_lead: number;
    },
  ) {

    return this.leadService.finalizarEtapaContactoAgendarReunion(data);

  }
  @Get('obtener-info-agendarreu-lead/:idLead')
  @UseGuards(JwtAuthGuard)
  obtenerInfoAgendarReuLead(
    @Param('idLead', ParseIntPipe) idLead: number,
  ) {

    return this.leadService.obtenerInfoAgendarReuLead(idLead);

  }

  @Post('registrar-whatsapp-reunion')
  @UseGuards(JwtAuthGuard)
  registrarWhatsappReunion(
    @Body()
    data: {
      id_estado_reunion: number;
      fecha: string;
      hora: string;
      tipo_historial: number;
    },
  ) {
    return this.leadService.registrarWhatsappreunion(data);
  }

  @Post('registrar-correo-reunion')
  @UseGuards(JwtAuthGuard)
  registrarCorreoReunion(
    @Body()
    data: {
      id_estado_reunion: number;
      url_evidencia: string;
      mensaje?: string;
      tipo_historial: number;
    },
  ) {
    return this.leadService.registrarCorreoreunion(data);
  }


  @Get('historial-correo/:id_estado_reunion/:tipo_historial/reunion')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialCorreoReunion(
    @Param('id_estado_reunion', ParseIntPipe)
    id_estado_reunion: number,

    @Param('tipo_historial', ParseIntPipe)
    tipo_historial: number,
  ) {
    return this.leadService.obtenerHistorialCorreoReunion(
      id_estado_reunion,
      tipo_historial,
    );
  }

  @Get('historial-whatsapp/:id_estado_reunion/:tipo_historial/reunion')
  @UseGuards(JwtAuthGuard)
  obtenerHistorialWhatsappReunion(
    @Param('id_estado_reunion', ParseIntPipe)
    id_estado_reunion: number,

    @Param('tipo_historial', ParseIntPipe)
    tipo_historial: number,
  ) {
    return this.leadService.obtenerHistorialWhatsappReunion(
      id_estado_reunion,
      tipo_historial,
    );
  }

  @Get('todas-actividades/:id_lead')
  @UseGuards(JwtAuthGuard)
  obtenerTodasActividades(
    @Param('id_lead', ParseIntPipe)
    id_lead: number,
  ) {
    return this.leadService.obtenerTodasActividades(id_lead);
  }
  @Post('finalizar-etapa-atencion/:id_lead')
  @UseGuards(JwtAuthGuard)
  finalizarEtapaAtencion(
    @Param('id_lead', ParseIntPipe)
    id_lead: number,
  ) {
    return this.leadService.finalizarEtapaAtencion(id_lead);
  }
  @Post('etapa-negociacion/checklist')
  actualizarChecklistNegociacion(
    @Body('id_lead_etapa', ParseIntPipe)
    id_lead_etapa: number,

    @Body('campo')
    campo: string,

    @Body('valor')
    valor: boolean,
  ) {
    return this.leadService.actualizarChecklistNegociacion(
      id_lead_etapa,
      campo,
      valor,
    );
  }

  @Get('etapa-negociacion/checklist/:id_lead')
  obtenerChecklistNegociacion(
    @Param('id_lead', ParseIntPipe)
    id_lead: number,
  ) {
    return this.leadService.obtenerChecklistNegociacion(
      id_lead,
    );
  }
  @Post('etapa-cierre/checklist')
  actualizarChecklistCierre(
    @Body('id_lead_etapa', ParseIntPipe)
    id_lead_etapa: number,

    @Body('campo')
    campo: string,

    @Body('valor')
    valor: boolean,
  ) {
    return this.leadService.actualizarChecklistCierre(
      id_lead_etapa,
      campo,
      valor,
    );
  }

  @Get('etapa-cierre/checklist/:id_lead')
  obtenerChecklistCierre(
    @Param('id_lead', ParseIntPipe)
    id_lead: number,
  ) {
    return this.leadService.obtenerChecklistCierre(
      id_lead,
    );
  }



  @Post('finalizar-actividad/:id_actividad')
  @UseGuards(JwtAuthGuard)
  finalizarActividad(
    @Param('id_actividad', ParseIntPipe) id_actividad: number,
  ) {
    return this.leadService.finalizarActividad(id_actividad);
  }

  @Post('registrar-documento-cierre')
  async registrarDocumentoCierre(
    @Body()
    data: {
      id_etapa_cierre: number;
      nombre_documento: string;
      url_documento: string;
      tipo_documento?: string;
    },
  ) {
    return await this.leadService.registrarDocumentoCierre(data);
  }

  @Get('obtener-documentos-cierre/:id_etapa_cierre')
  async obtenerDocumentosCierre(
    @Param('id_etapa_cierre', ParseIntPipe)
    id_etapa_cierre: number,
  ) {
    return await this.leadService.obtenerDocumentosCierre(
      id_etapa_cierre,
    );
  }
  @Delete('eliminar-documento-cierre/:id')
  async eliminarDocumentoCierre(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return await this.leadService.eliminarDocumentoCierre(id);
  }

  @Post('guardar-mensaje-lead-etapa-contacto')
  async guardarMensajeLeadEtapaContacto(
    @Body() body: {
      id_lead_etapa_contacto: number;
      mensaje: string;
    },
  ) {
    return await this.leadService.guardarMensajeLeadEtapaContacto(
      body.id_lead_etapa_contacto,
      body.mensaje,
    );
  }

  @Get('obtener-historial-mensajes-lead-etapa-contacto/:id')
  async obtenerHistorialMensajesLeadEtapaContacto(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return await this.leadService.obtenerHistorialMensajesLeadEtapaContacto(
      id,
    );
  }
}


