import { DataSource } from 'typeorm';
import { JSONResponse, Response } from "../../../interfaces/responses.interface";
import { RolListado, Trabajador, EstadosConexionListado } from '../interfaces/trabajador.interface';
import { ITrabajadorPorCampania } from '../interfaces/trabajador-por-campania.interface';
import { ListTrabajadoresResponseDTO } from '../dto/trabajador.dto';
export declare class TrabajadorRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    per_registro_trabajador(idTipoDocumento: number, nroDocumento: string, nombre: string, apellido: string, correo: string, celular: string, fechaNacimiento: string, campanias: any, id_trabajador?: number): Promise<Response>;
    per_obtener_estado_conexion_agente(idTrabajador: number): Promise<JSONResponse>;
    fn_listar_trabajadores_agentes(id_trabajador?: number, id_estado_conexion?: number, busqueda?: string, id_campania?: number, limit?: number, offset?: number): Promise<ListTrabajadoresResponseDTO>;
    fn_cambiar_estado_conexion_agente(id_trabajador: number, id_estado_conexion: number): Promise<JSONResponse>;
    fn_listado_roles(id_rol?: number): Promise<RolListado[]>;
    adm_obtener_trabajador(id_trabajador: number): Promise<Trabajador[]>;
    fn_listado_estados_conexion(id_estado_conexion?: number): Promise<EstadosConexionListado[]>;
    fn_obtener_trabajadores_por_campania(id_campania: number): Promise<ITrabajadorPorCampania[]>;
}
