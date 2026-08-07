import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthResponse } from 'src/interfaces/responses.interface';
import { CheckStatusUsuario, Usuario } from '../interfaces/auth.interfaces';
import { CheckStatusQueryResult } from '../interfaces/auth.interfaces';
@Injectable()
export class AuthRepository {
  constructor(private dataSource: DataSource) {}

  async login(usuario: string, contrasenia: string) {
    const result: AuthResponse[] = await this.dataSource.query(
      `SELECT * FROM seg_authenticate($1, $2)`,
      [usuario, contrasenia],
    );
    return result[0];
  }

  async seg_usuario_get(id_usuario: number) {
    const result: Usuario[] = await this.dataSource.query(
      `SELECT * FROM seg_usuario_get($1)`,
      [id_usuario],
    );
    return result;
  }

  async seg_usuario_checkstatus(
    id_usuario: number,
  ): Promise<CheckStatusUsuario[] | null> {
    const result = await this.dataSource.query<CheckStatusQueryResult[]>(
      `SELECT seg_usuario_checkstatus($1) AS data`,
      [id_usuario],
    );
    return result[0]?.data ?? null;
  }
}
