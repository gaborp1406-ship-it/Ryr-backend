import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'src/interfaces/responses.interface';
import { Usuario } from '../interfaces/usuario.interfaces';
import { UsuarioSip } from '../interfaces/usuario-sip.interface';
@Injectable()
export class UsuarioRepository {
  constructor(private dataSource: DataSource) {}

  async seg_registrar_usuario(
    idTrabajador: number,
    usuario: string,
    contrasenia: string,
    roles?: Array<{ idrol: number; estado: number }>,
  ) {
    const rolesJson = roles ? JSON.stringify(roles) : JSON.stringify([]);

    const result: Response[] = await this.dataSource.query(
      `SELECT * FROM seg_usuario_registrar($1, $2, $3, $4::json)`,
      [idTrabajador, usuario, contrasenia, rolesJson],
    );
    return result[0];
  }
async obtenerCredencialesSip(id_usuario: number) {
  const result: UsuarioSip[] = await this.dataSource.query(
    `
    SELECT
      su.id_trabajador,
      su.extension,
      su.username,
      su.password
    FROM sip_agentes su
    WHERE su.id_trabajador = $1
      AND su.activo = true
    `,
    [id_usuario],
  );

  return result[0] || null;
}
  
}
