import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AriService } from './ari.service';
import { AriInternalGuard } from '../auth/guard/ari.guard';
import { ColaRequestDto } from './dto/cola.dto';
import { GrabacionesRequestDto } from './dto/grabaciones.dto';
import { LlamadasRequestDto } from './dto/llamadas.dto';
import { ActualizarGrabacionLlamadaDto } from './dto/grabaciones.dto';
import {
  ContarAgentesDisponiblesRequestDto,
  ContarLlamadasEnCursoRequestDto,
  MarcadorRequestDto,
  ObtenerDatosProcesoRequestDto,
  RecuperarZombiesRequestDto,
  TomarContactosPredictvoRequestDto,
} from './dto/marcador.dto';
import { UserId } from '../auth/decorators/user-id.decorator';

@UseGuards(AriInternalGuard)
@Controller('ari')
export class AriController {
  constructor(private readonly ariService: AriService) {}

  /* Endpoints de Colas de llamadas*/
  @Post('tomar-registro')
  @HttpCode(200)
  tomarRegistro(
    @Body() data: ColaRequestDto,
    @UserId() id_usuario_registro: number | null,
  ) {
    const idFinal = id_usuario_registro || data.id_usuario_registro || 1;
    return this.ariService.registroTomado(data, idFinal);
  }

  @Post('no-contesta')
  @HttpCode(200)
  noContesta(@Body() data: ColaRequestDto) {
    return this.ariService.manejarNoContesta(data);
  }

  @Post('trunk-lleno')
  @HttpCode(200)
  trunkLleno(@Body() data: ColaRequestDto) {
    return this.ariService.marcarTrunkLleno(data);
  }

  /* Endpoints de Llamadas */
  @Post('crear-llamada')
  @HttpCode(200)
  crearLlamada(
    @Body() data: LlamadasRequestDto,
    @UserId() id_usuario_registro: number | null,
  ) {
    const idFinal = id_usuario_registro || data.id_usuario_registro || 1;
    return this.ariService.crearRegistroLlamada(data, idFinal);
  }

  @Post('finalizar-llamada')
  @HttpCode(200)
  finalizarLlamada(@Body() data: LlamadasRequestDto) {
    return this.ariService.finalizarLlamada(data);
  }

  @Post('marcar-reintento')
  @HttpCode(200)
  marcarReintento(@Body() data: LlamadasRequestDto) {
    return this.ariService.marcarReintento(data);
  }

  /* Endpoints de Grabaciones*/
  @Post('crear-grabacion')
  @HttpCode(200)
  crearGrabacion(
    @Body() data: GrabacionesRequestDto,
    @UserId() id_usuario_registro: number | null,
  ) {
    const idFinal = id_usuario_registro || data.id_usuario_registro || 1;
    return this.ariService.crearGrabacion(data, idFinal);
  }

  @Post('actualizar-grabacion')
  @HttpCode(200)
  actualizarGrabacion(@Body() data: GrabacionesRequestDto) {
    return this.ariService.actualizarGrabacion(data);
  }

  @Post('buscar-contacto')
  @HttpCode(200)
  buscarContactoPorNumero(@Body() data: { numero: string }) {
    return this.ariService.buscarContactoPorNumero(data.numero);
  }

  @Post('actualizar-grabacion-llamada')
  @HttpCode(200)
  async actualizarGrabacionLlamada(
    @Body() dto: ActualizarGrabacionLlamadaDto,
  ): Promise<{ message: string }> {
    await this.ariService.actualizarGrabacionLlamada(
      dto.idRegistroLlamada,
      dto.idRegistroGrabacion,
    );

    return { message: 'Grabación actualizada correctamente' };
  }

  //Endpoints del Marcador Progresivo
  @Post('obtener-campania-activa')
  @HttpCode(200)
  obtenerCampaniaActiva(@Body() data: MarcadorRequestDto) {
    return this.ariService.obtenerCampaniaActiva(data);
  }

  @Post('tomar-siguiente-contacto')
  @HttpCode(200)
  async tomarSiguienteContacto(@Body() data: MarcadorRequestDto) {
    const result = await this.ariService.tomarSiguienteContacto(data);
    return result ?? null;
  }

  @Post('finalizar-registro-cola')
  @HttpCode(200)
  finalizarRegistroCola(@Body() data: MarcadorRequestDto) {
    return this.ariService.finalizarRegistroCola(data);
  }

  @Post('liberar-registro-cola')
  @HttpCode(200)
  liberarRegistroCola(@Body() data: MarcadorRequestDto) {
    return this.ariService.liberarRegistroCola(data);
  }

  @Post('cambiar-estado-trabajador')
  @HttpCode(200)
  cambiarEstadoTrabajador(@Body() data: MarcadorRequestDto) {
    return this.ariService.cambiarEstadoConexionAgente(data);
  }

  @Post('recuperar-zombies')
  async recuperarZombies(@Body() data: RecuperarZombiesRequestDto) {
    return this.ariService.recuperarContactosEnProceso(data);
  }

  @Post('obtener-estado-trabajador')
  @HttpCode(200)
  obtenerEstadoTrabajador(@Body() data: MarcadorRequestDto) {
    return this.ariService.obtenerEstadoTrabajador(data);
  }

  @Post('obtener-procesos-predictivos')
  @HttpCode(200)
  obtenerProcesosPredictivos() {
    return this.ariService.obtenerProcesosPredictivos();
  }

  @Post('obtener-datos-proceso')
  @HttpCode(200)
  obtenerDatosProcesoSaliente(@Body() data: ObtenerDatosProcesoRequestDto) {
    return this.ariService.obtenerDatosProcesoSaliente(data);
  }

  @Post('contar-agentes-disponibles')
  @HttpCode(200)
  contarAgentesDisponibles(@Body() data: ContarAgentesDisponiblesRequestDto) {
    return this.ariService.contarAgentesDisponibles(data);
  }

  @Post('contar-llamadas-en-curso')
  @HttpCode(200)
  contarLlamadasEnCurso(@Body() data: ContarLlamadasEnCursoRequestDto) {
    return this.ariService.contarLlamadasEnCurso(data);
  }

  @Post('tomar-contactos-predictivo')
  @HttpCode(200)
  tomarContactosPredictivo(@Body() data: TomarContactosPredictvoRequestDto) {
    return this.ariService.tomarContactosPredictivo(data);
  }
}
