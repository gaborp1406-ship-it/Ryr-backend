import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Response,
  JSONResponse,
  EstadoTrabajadorResponse,
} from 'src/interfaces/responses.interface';
import {
  RegistroTomado,
  ResultadoNoContesta,
  CampanaActiva,
  SiguienteContacto,
} from '../interfaces/cola.interfaces';
import { DatosProcesoSaliente } from '../dto/marcador.dto';

@Injectable()
export class MarcadorRepository {
  constructor(private dataSource: DataSource) {}

  // ─── Existentes ───────────────────────────────────────────────────────────

  async fn_ari_tomar_registro(
    id_cola: number,
    id_usuario: number | null,
  ): Promise<RegistroTomado | null> {
    const result = await this.dataSource.query<RegistroTomado[]>(
      `SELECT * FROM fn_ari_tomar_registro($1, $2)`,
      [id_cola, id_usuario],
    );
    return result[0] ?? null;
  }

  async ari_manejar_no_contesta(id_cola: number): Promise<ResultadoNoContesta> {
    const result = await this.dataSource.query<ResultadoNoContesta[]>(
      `SELECT * FROM ari_manejar_no_contesta($1)`,
      [id_cola],
    );
    return result[0];
  }

  async ari_marcar_trunk_lleno(id_cola: number): Promise<Response> {
    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM ari_marcar_trunk_lleno($1)`,
      [id_cola],
    );
    return result[0];
  }

  // ─── Marcador Progresivo ──────────────────────────────────────────────────

  async fn_obtener_campania_activa(
    idTrabajador: number,
  ): Promise<CampanaActiva | null> {
    const result = await this.dataSource.query<CampanaActiva[]>(
      `SELECT * FROM fn_obtener_campania_activa($1)`,
      [idTrabajador],
    );
    return result[0] ?? null;
  }

  async fn_tomar_siguiente_contacto(
    idProcesoSaliente: number,
    idTrabajador: number,
    reintentosMaximos?: number,
    reintentosTotales?: number,
  ): Promise<SiguienteContacto | null> {
    const result = await this.dataSource.query<SiguienteContacto[]>(
      `SELECT * FROM fn_tomar_siguiente_contacto($1, $2, $3, $4)`,
      [idProcesoSaliente, idTrabajador, reintentosMaximos, reintentosTotales],
    );
    return result[0] ?? null;
  }

  async fn_finalizar_registro_cola(
    idCola: number,
    idEstadoCola: number,
  ): Promise<Response> {
    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM fn_finalizar_registro_cola($1, $2)`,
      [idCola, idEstadoCola],
    );
    return result[0];
  }

  async fn_liberar_registro_cola(idCola: number): Promise<Response> {
    const result = await this.dataSource.query<Response[]>(
      `SELECT * FROM fn_liberar_registro_cola($1)`,
      [idCola],
    );
    return result[0];
  }

  async per_cambiar_estado_conexion_agente(
    idTrabajador: number,
    idEstadoConexionInicial: number,
  ): Promise<JSONResponse> {
    const result = await this.dataSource.query<JSONResponse[]>(
      `SELECT * FROM per_cambiar_estado_conexion_agente($1, $2)`,
      [idTrabajador, idEstadoConexionInicial],
    );
    return result[0];
  }

  async recuperarContactosEnProceso(
    idProcesoSaliente: number,
    reintentosMaximos: number,
  ): Promise<number> {
    const result = await this.dataSource.query<{ n: number }[]>(
      `SELECT fn_recuperar_contactos_en_proceso($1, $2) AS n`,
      [idProcesoSaliente, reintentosMaximos],
    );
    return result[0]?.n ?? 0;
  }

  async per_obtener_estado_conexion_agente(
    idTrabajador: number,
  ): Promise<EstadoTrabajadorResponse | null> {
    const result = await this.dataSource.query<
      Array<{ resultado: EstadoTrabajadorResponse }>
    >(`SELECT per_obtener_estado_conexion_agente($1) AS resultado`, [
      idTrabajador,
    ]);

    if (!result || !result[0]) {
      return null;
    }

    return result[0].resultado;
  }

  async obtenerProcesosPredictivos(): Promise<
    Array<{
      id: number;
      id_modo_marcacion: number;
      factor_sobremarcado: number;
      intervalo_loop_seg: number;
      reintentos_maximos: number;
      reintentos_totales: number;
    }>
  > {
    const result = await this.dataSource.query<
      Array<{
        id: number;
        id_modo_marcacion: number;
        factor_sobremarcado: number;
        intervalo_loop_seg: number;
        reintentos_maximos: number;
        reintentos_totales: number;
      }>
    >(
      `SELECT id, id_modo_marcacion, factor_sobremarcado, intervalo_loop_seg, reintentos_maximos, reintentos_totales
     FROM adm_procesos_salientes
     WHERE id_modo_marcacion = 20 AND estado = 1
     ORDER BY id`,
    );
    return result ?? [];
  }

  async obtenerDatosProcesoSaliente(
    idProcesoSaliente: number,
  ): Promise<DatosProcesoSaliente | null> {
    const result = await this.dataSource.query<
      Array<{
        id: number;
        id_campania: number;
        reintentos_maximos: number;
        reintentos_totales: number;
        factor_sobremarcado: number;
      }>
    >(
      `SELECT id, id_campania, reintentos_maximos, reintentos_totales, factor_sobremarcado
     FROM adm_procesos_salientes
     WHERE id = $1`,
      [idProcesoSaliente],
    );
    return result[0] ?? null;
  }

  async fn_contar_agentes_disponibles(
    idProcesoSaliente: number,
  ): Promise<number> {
    const result = await this.dataSource.query<
      Array<{ agentes_disponibles: number }>
    >(`SELECT fn_contar_agentes_disponibles($1) AS agentes_disponibles`, [
      idProcesoSaliente,
    ]);
    return result[0]?.agentes_disponibles ?? 0;
  }

  async fn_contar_llamadas_en_curso(
    idProcesoSaliente: number,
  ): Promise<number> {
    const result = await this.dataSource.query<Array<{ en_curso: number }>>(
      `SELECT fn_contar_llamadas_en_curso($1) AS en_curso`,
      [idProcesoSaliente],
    );
    return result[0]?.en_curso ?? 0;
  }

  async fn_tomar_contactos_predictivo(
    idProcesoSaliente: number,
    idUsuario: number,
    reintentosMaximos: number,
    reintentosTotales: number,
    cantidad: number,
  ): Promise<
    Array<{ id: number; numero: string; id_contacto: number; intentos: number }>
  > {
    const result = await this.dataSource.query<
      Array<{
        id: number;
        numero: string;
        id_contacto: number;
        intentos: number;
      }>
    >(`SELECT * FROM fn_tomar_contactos_predictivo($1, $2, $3, $4, $5)`, [
      idProcesoSaliente,
      idUsuario,
      reintentosMaximos,
      reintentosTotales,
      cantidad,
    ]);
    return result ?? [];
  }
}
