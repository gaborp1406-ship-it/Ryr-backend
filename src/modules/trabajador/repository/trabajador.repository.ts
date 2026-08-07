import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JSONResponse, Response } from 'src/interfaces/responses.interface';
import {
  RolListado,
  Trabajador,
  EstadosConexionListado,
} from '../interfaces/trabajador.interface';
import { ITrabajadorPorCampania } from '../interfaces/trabajador-por-campania.interface';
import { ListTrabajadoresResponseDTO } from '../dto/trabajador.dto';
@Injectable()
export class TrabajadorRepository {
  constructor(private dataSource: DataSource) {}

  async per_registro_trabajador(
    idTipoDocumento: number,
    nroDocumento: string,
    nombre: string,
    apellido: string,
    correo: string,
    celular: string,
    fechaNacimiento: string,
    campanias: any,
    id_trabajador?: number,
  ) {
    const result: Response[] = await this.dataSource.query(
      `SELECT * FROM per_registro_trabajador($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        idTipoDocumento,
        nroDocumento,
        nombre,
        apellido,
        correo,
        celular,
        fechaNacimiento,
        campanias ? JSON.stringify(campanias) : null,
        id_trabajador || null,
      ],
    );
    return result[0];
  }

  async per_obtener_estado_conexion_agente(
    idTrabajador: number,
  ): Promise<JSONResponse> {
    const [{ per_obtener_estado_conexion_agente: resp }] =
      await this.dataSource.query<
        Array<{ per_obtener_estado_conexion_agente: JSONResponse }>
      >(`SELECT per_obtener_estado_conexion_agente($1)`, [idTrabajador]);
    return resp;
  }

  async fn_listar_trabajadores_agentes(
    id_trabajador?: number,
    id_estado_conexion?: number,
    busqueda?: string,
    id_campania?: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ListTrabajadoresResponseDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(
      `SELECT * FROM fn_listar_trabajadores_agentes($1, $2, $3, $4, $5, $6)`,
      [
        id_trabajador || null,
        id_estado_conexion || null,
        busqueda || undefined,
        id_campania || null,
        limit,
        offset,
      ],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    const data = result[0]
      ?.fn_listar_trabajadores_agentes as ListTrabajadoresResponseDTO;
    return data || { data: [], total: 0 };
  }

  async fn_cambiar_estado_conexion_agente(
    id_trabajador: number,
    id_estado_conexion: number,
  ) {
    const result: JSONResponse[] = await this.dataSource.query(
      `SELECT * FROM fn_cambiar_estado_conexion_agente($1, $2) AS data`,
      [id_trabajador, id_estado_conexion],
    );
    return result[0];
  }

  async fn_listado_roles(id_rol?: number): Promise<RolListado[]> {
    const result = await this.dataSource.query<RolListado[]>(
      `SELECT * FROM fn_listado_roles($1)`,
      [id_rol ?? null],
    );

    return result;
  }

  async adm_obtener_trabajador(id_trabajador: number): Promise<Trabajador[]> {
    const result = await this.dataSource.query<
      Array<{ adm_obtener_trabajador: Trabajador[] }>
    >(`SELECT * FROM adm_obtener_trabajador($1)`, [id_trabajador]);

    return result[0]?.adm_obtener_trabajador ?? [];
  }

  async fn_listado_estados_conexion(
    id_estado_conexion?: number,
  ): Promise<EstadosConexionListado[]> {
    const result = await this.dataSource.query<EstadosConexionListado[]>(
      `SELECT * FROM fn_listado_estados_conexion($1)`,
      [id_estado_conexion ?? null],
    );
    return result;
  }

  async fn_obtener_trabajadores_por_campania(
    id_campania: number,
  ): Promise<ITrabajadorPorCampania[]> {
    const result = await this.dataSource.query<
      Array<{ fn_obtener_trabajadores_por_campania: ITrabajadorPorCampania[] }>
    >(`SELECT * FROM fn_obtener_trabajadores_por_campania($1)`, [id_campania]);

    return result[0]?.fn_obtener_trabajadores_por_campania ?? [];
  }
}
