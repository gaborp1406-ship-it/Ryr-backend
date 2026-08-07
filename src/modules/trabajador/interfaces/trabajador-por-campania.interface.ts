export interface ITrabajadorPorCampania {
  id_campania: number;
  nombre_campania: string;
  descripcion_campania: string;
  horarios_campanias: HorariosCampanias[];
  trabajadores_por_campania: TrabajadoresCampania[];
}

interface HorariosCampanias {
  id: number;
  horario_inicio: string;
  horario_fin: string;
  id_dia_semana: number;
  dia_semana: number;
}

interface TrabajadoresCampania {
  id: number;
  nombre_completo: number;
  id_usuario: number;
  usuario: string;
}
