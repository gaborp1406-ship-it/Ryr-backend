import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { AngelRepository } from './repository/trabajador.repository';

@Injectable()
export class AngelService {
  constructor(
    private angelRepository: AngelRepository,
  ) { }

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

  async crearDatosReales(data: {
    id_orden: number;
    mano_obra_real: number;
    materiales: any[];
    riesgos: any[];
  }) {
    try {
      return await this.angelRepository.crearDatosReales(
        data.id_orden,
        data.mano_obra_real,
        data.materiales,
        data.riesgos,
      );
    } catch (error) {
      console.log(
        'Error al registrar datos reales:',
        error,
      );

      throw new InternalServerErrorException(
        'Error al registrar los datos reales',
      );
    }
  }

async obtenerDashboard() {
  try {
    return await this.angelRepository.obtenerDashboard();
  } catch (error) {
    console.log(
      'Error al obtener dashboard:',
      error,
    );

    throw new InternalServerErrorException(
      'Error al obtener los datos del dashboard',
    );
  }
}
async obtenerDetalleOrdenIndicadores(idOrden: number) {
  try {
    return await this.angelRepository.obtenerDetalleOrdenIndicadores(
      idOrden,
    );
  } catch (error) {
    console.log(
      'Error al obtener indicadores de la orden:',
      error,
    );

    throw new InternalServerErrorException(
      'Error al obtener los indicadores de la orden',
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
  // GUARDAR ANÁLISIS ML
  // ==========================================================

  async guardarAnalisisMl(data: {
    id_orden: number;
    mano_obra: number;
    version_modelo?: string;
    materiales: {
      material: string;
      cantidad?: number | null;
      unidad?: string | null;
      probabilidad?: number | null;
    }[];
    riesgos: {
      riesgo: string;
      probabilidad?: number | null;
    }[];
  }) {
    try {
      return await this.angelRepository.guardarAnalisisMl(
        data.id_orden,
        data.mano_obra,
        data.version_modelo ?? null,
        data.materiales,
        data.riesgos,
      );
    } catch (error) {
      console.log('Error al guardar análisis ML:', error);

      throw new InternalServerErrorException(
        'Error al guardar el análisis ML',
      );
    }
  }


}