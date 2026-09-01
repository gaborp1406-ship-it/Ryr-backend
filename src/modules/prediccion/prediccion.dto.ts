export class ConsultarPrediccionDto {
  descripcion: string;
  top_n_materiales?: number;
  top_n_riesgos?: number;
  umbral_probabilidad?: number;
}

export interface MaterialSugerido {
  material: string;
  probabilidad: number;
}

export interface RiesgoSugerido {
  riesgo: string;
  probabilidad: number;
}

export interface TrabajoSimilar {
  descripcion: string;
  similitud: number;
  mano_obra_real: number;
  materiales_usados: string[];
  riesgos_registrados: string[];
}

export interface RespuestaPrediccion {
  descripcion_consultada: string;
  mano_obra_estimada: number;
  materiales_sugeridos: MaterialSugerido[];
  riesgos_sugeridos: RiesgoSugerido[];
  trabajos_similares: TrabajoSimilar[];
}
