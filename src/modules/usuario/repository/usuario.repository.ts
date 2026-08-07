import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'src/interfaces/responses.interface';
import { Usuario } from '../interfaces/usuario.interfaces';
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

  
}
