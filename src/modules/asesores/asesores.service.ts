import { Injectable } from '@nestjs/common';
import { AsesoresRepository } from './repository/asesores.repository';

@Injectable()
export class AsesoresService {
  constructor(private asesoresRepository: AsesoresRepository) {}

  async listarAsesorDisponible(id_trabajador: number) {
    return await this.asesoresRepository.gen_listar_asesor_disponible(
      id_trabajador,
    );
  }

  async listarAsesores() {
    return await this.asesoresRepository.gen_listar_asesores();
  }
}