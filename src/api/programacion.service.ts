import { apiClient } from "./apiClient";

// Interfaces para programación
export interface Programacion {
  id_instructor: number;
  cod_ficha: number;
  fecha_programada: string;
  horas_programadas: number;
  hora_inicio: string;
  hora_fin: string;
  cod_competencia: number;
  cod_resultado: number;
  id_programacion: number;
  id_user: number;
  nombre_instructor: string;
  nombre_competencia: string;
  nombre_resultado: string;
  [key: string]: any;
}

export interface Competencia {
  cod_competencia: number;
  nombre_competencia: string;
  cod_programa: number;
  version: number;
  [key: string]: any;
}

export interface ResultadoAprendizaje {
  cod_resultado: number;
  nombre_resultado: string;
  cod_competencia: number;
  [key: string]: any;
}

export interface CreateProgramacionPayload {
  id_instructor: number;
  cod_ficha: number;
  fecha_programada: string;
  horas_programadas: number;
  hora_inicio: string;
  hora_fin: string;
  cod_competencia: number;
  cod_resultado: number;
}

export interface UpdateProgramacionPayload {
  id_instructor?: number;
  cod_ficha?: number;
  fecha_programada?: string;
  horas_programadas?: number;
  hora_inicio?: string;
  hora_fin?: string;
  cod_competencia?: number;
  cod_resultado?: number;
}

/**
 * Función para obtener las programaciones por código de ficha
 * @param codFicha - Código de la ficha para filtrar las programaciones
 * @returns Promise con la lista de programaciones de la ficha
 */
const getProgramacionesPorFicha = async (codFicha: number): Promise<Programacion[]> => {
  try {
    const endpoint = `/programacion/${codFicha}`;
    const programacionesData = await apiClient(endpoint, "GET");
    return programacionesData;
  } catch (error) {
    console.error(`Error al obtener programaciones para la ficha ${codFicha}:`, error);
    throw error;
  }
};

/**
 * Función para obtener el detalle de una programación específica
 * @param idProgramacion - ID de la programación
 * @returns Promise con los datos del detalle de la programación
 */
const getProgramacionDetalle = async (idProgramacion: number): Promise<Programacion> => {
  try {
    const endpoint = `/programacion/detalle/${idProgramacion}`;
    const programacionDetalle = await apiClient(endpoint, "GET");
    return programacionDetalle;
  } catch (error) {
    console.error(`Error al obtener detalle de la programación ${idProgramacion}:`, error);
    throw error;
  }
};

/**
 * Función para obtener las competencias por programa y versión
 * @param codPrograma - Código del programa
 * @param version - Versión del programa
 * @returns Promise con la lista de competencias del programa
 */
const getCompetenciasPorPrograma = async (codPrograma: number, version: number): Promise<Competencia[]> => {
  try {
    const endpoint = `/programacion/competencias/${codPrograma}/${version}`;
    const competenciasData = await apiClient(endpoint, "GET");
    return competenciasData;
  } catch (error) {
    console.error(`Error al obtener competencias para el programa ${codPrograma} versión ${version}:`, error);
    throw error;
  }
};

/**
 * Función para obtener los resultados de aprendizaje por competencia
 * @param codCompetencia - Código de la competencia
 * @returns Promise con la lista de resultados de aprendizaje de la competencia
 */
const getResultadosPorCompetencia = async (codCompetencia: number): Promise<ResultadoAprendizaje[]> => {
  try {
    const endpoint = `/programacion/resultados/${codCompetencia}`;
    const resultadosData = await apiClient(endpoint, "GET");
    return resultadosData;
  } catch (error) {
    console.error(`Error al obtener resultados para la competencia ${codCompetencia}:`, error);
    throw error;
  }
};

/**
 * Función para crear una nueva programación
 * @param data - Datos de la nueva programación a crear
 * @returns Promise con los datos de la programación creada
 */
const crearProgramacion = async (data: CreateProgramacionPayload): Promise<Programacion> => {
  try {
    const endpoint = "/programacion/";
    const nuevaProgramacion = await apiClient(endpoint, "POST", { body: data });
    return nuevaProgramacion;
  } catch (error) {
    console.error("Error al crear la programación:", error);
    throw error;
  }
};

/**
 * Función para actualizar una programación existente
 * @param idProgramacion - ID de la programación a actualizar
 * @param data - Datos a actualizar de la programación
 * @returns Promise con los datos de la programación actualizada
 */
const actualizarProgramacion = async (idProgramacion: number, data: UpdateProgramacionPayload): Promise<Programacion> => {
  try {
    const endpoint = `/programacion/${idProgramacion}`;
    const programacionActualizada = await apiClient(endpoint, "PUT", { body: data });
    return programacionActualizada;
  } catch (error) {
    console.error(`Error al actualizar la programación ${idProgramacion}:`, error);
    throw error;
  }
};

/**
 * Función para eliminar una programación
 * @param idProgramacion - ID de la programación a eliminar
 * @returns Promise con la respuesta del servidor
 */
const eliminarProgramacion = async (idProgramacion: number): Promise<void> => {
  try {
    const endpoint = `/programacion/${idProgramacion}`;
    await apiClient(endpoint, "DELETE");
  } catch (error) {
    console.error(`Error al eliminar la programación ${idProgramacion}:`, error);
    throw error;
  }
};

// Exportar las funciones como un objeto programacionService
export const programacionService = {
  getProgramacionesPorFicha,
  getProgramacionDetalle,
  getCompetenciasPorPrograma,
  getResultadosPorCompetencia,
  crearProgramacion,
  actualizarProgramacion,
  eliminarProgramacion,
}; 