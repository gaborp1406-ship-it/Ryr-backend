import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { AngelRepository } from './repository/trabajador.repository';

@Injectable()
export class AngelService {
  constructor(
    private angelRepository: AngelRepository,
  ) {}

// ==========================================================
// LISTAR MATERIALES
// ==========================================================

async listarMateriales() {
  try {
    return await this.angelRepository.listarMateriales();
  } catch (error) {
    console.log('Error al listar materiales:', error);

    throw new InternalServerErrorException(
      'Error al listar los materiales',
    );
  }
}

// ==========================================================
// LISTAR RIESGOS
// ==========================================================

async listarRiesgos() {
  try {
    return await this.angelRepository.listarRiesgos();
  } catch (error) {
    console.log('Error al listar riesgos:', error);

    throw new InternalServerErrorException(
      'Error al listar los riesgos',
    );
  }
}
async listarOrdenes(
  fechaInicio?: string,
  fechaFin?: string,
) {
  try {
    return await this.angelRepository.listarOrdenes(
      fechaInicio,
      fechaFin,
    );
  } catch (error) {
    console.log('Error al listar órdenes:', error);

    throw new InternalServerErrorException(
      'Error al listar las órdenes',
    );
  }
}
  async crearOrden(data: {
    numero_orden: string;
    descripcion_trabajo: string;
    mano_obra: number;
    estado?: string;
    materiales: any[];
    riesgos: any[];
  }) {
    try {
      return await this.angelRepository.crearOrden(
        data.numero_orden,
        data.descripcion_trabajo,
        data.mano_obra,
        data.materiales,
        data.riesgos,
        data.estado,
      );
    } catch (error) {
      console.log('Error al crear orden:', error);

      throw new InternalServerErrorException(
        'Error al crear la orden',
      );
    }
  }

  // ==========================================================
  // CREAR ORDEN POR NOMBRES
  // ==========================================================

  async crearOrdenPorNombres(data: {
    numero_orden: string;
    descripcion_trabajo: string;
    mano_obra: number;
    estado?: string;
    materiales: any[];
    riesgos: any[];
  }) {
    try {
      return await this.angelRepository.crearOrdenPorNombres(
        data.numero_orden,
        data.descripcion_trabajo,
        data.mano_obra,
        data.materiales,
        data.riesgos,
        data.estado,
      );
    } catch (error) {
      console.log(
        'Error al crear orden por nombres:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al crear la orden por nombres',
      );
    }
  }
}