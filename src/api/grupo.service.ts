import { apiClient } from "./apiClient";

// Interfaz para la estructura de un Grupo (coincide con el schema GrupoOut de FastAPI)
export interface Grupo {
  cod_ficha: number;
  cod_centro?: number;
  cod_programa?: number;
  la_version?: number;
  estado_grupo?: string;
  nombre_nivel?: string;
  jornada?: string;
  fecha_inicio?: string; // Las fechas se manejarán como string
  fecha_fin?: string;
  etapa?: string;
  modalidad?: string;
  responsable?: string;
  nombre_empresa?: string;
  nombre_municipio?: string;
  nombre_programa_especial?: string;
  hora_inicio?: string; // Las horas se manejarán como string
  hora_fin?: string;
  id_ambiente?: number | null;
  nombre_programa?: string;
  nombre_ambiente?: string | null;
  [key: string]: any;
}

// Interfaz para los datos que se pueden actualizar (coincide con GrupoUpdate de FastAPI)
export interface UpdateGrupoPayload {
  hora_inicio?: string;
  hora_fin?: string;
  id_ambiente?: number | null;
}

// Interfaz para la relación grupo-instructor
export interface GrupoInstructor {
  cod_ficha: number;
  id_instructor: number;
}

// Interfaz para la respuesta completa del endpoint grupo-instructor/instructor/{id}
export interface GrupoInstructorCompleto {
  cod_ficha: number;
  id_instructor: number;
  estado_grupo: string;
  jornada: string;
  fecha_inicio: string;
  fecha_fin: string;
  etapa: string;
  nombre_programa: string;
  nombre_centro: string;
}

// --- Interfaces para el Dashboard ---

// Define los filtros que usarán los endpoints del dashboard
export interface DashboardFilters {
  estado_grupo: string;
  año?: number; // El año es opcional
  nombre_nivel?: string; // El nombre del nivel es opcional
  etapa?: string; // La etapa es opcional
  modalidad?: string; // La modalidad es opcional
  jornada?: string; // La jornada es opcional
  nombre_municipio?: string; // El nombre del municipio es opcional
}

// Coincide con DashboardKPISchema
export interface DashboardKPI {
  total_grupo: number;
  total_aprendices_formacion: number;
}

// Coincide con GruposPorMunicipioSchema
export interface DistribucionMunicipio {
  municipio: string;
  cantidad: number;
  total_aprendices_formacion: number;
}

// Coincide con GruposPorJornadaSchema
export interface DistribucionJornada {
  jornada: string;
  cantidad: number;
  total_aprendices_formacion: number;
}

// Coincide con GruposPorModalidadSchema
export interface DistribucionModalidad {
  modalidad: string;
  cantidad: number;
  total_aprendices_formacion: number;
}

// Coincide con GruposPorEtapaSchema
export interface DistribucionEtapa {
  etapa: string;
  cantidad: number;
  total_aprendices_formacion: number;
}

// Coincide con GruposPorNivelSchema
export interface DistribucionNivel {
  nivel: string;
  cantidad: number;
  total_aprendices_formacion: number;
}

/**
 * Función para obtener los grupos por código de centro con paginación
 * @param cod_centro - Código del centro para filtrar los grupos
 * @param skip - Número de elementos a omitir (para paginación)
 * @param limit - Límite de elementos a retornar por página
 * @returns Promise con el objeto de paginación que incluye items y total_items
 */
const getGruposByCentro = async (
  cod_centro: number,
  skip: number,
  limit: number
): Promise<{ items: Grupo[]; total_items: number }> => {
  try {
    const endpoint = `/grupos/centro/${cod_centro}?skip=${skip}&limit=${limit}`;
    const data = await apiClient(endpoint, "GET");

    // Validación para asegurar que la respuesta tenga el formato esperado
    if (
      data &&
      typeof data === "object" &&
      Array.isArray(data.items) &&
      typeof data.total_items === "number"
    ) {
      return data;
    } else {
      console.warn(
        "La respuesta del servidor no tiene el formato esperado:",
        data
      );
      return { items: [], total_items: 0 };
    }
  } catch (error) {
    console.error(
      `Error al obtener grupos para el centro ${cod_centro}:`,
      error
    );
    throw error;
  }
};

/**
 * Función para realizar búsqueda avanzada de grupos con paginación
 * @param query - Término de búsqueda
 * @param cod_centro - Código del centro para filtrar los grupos
 * @param skip - Número de elementos a omitir (para paginación)
 * @param limit - Límite de elementos a retornar por página
 * @returns Promise con el objeto de paginación que incluye items y total_items
 */
const advancedSearchGrupos = async (
  query: string,
  cod_centro: number,
  skip: number,
  limit: number
): Promise<{ items: Grupo[]; total_items: number }> => {
  try {
    const endpoint = `/grupos/advanced-search/?query=${encodeURIComponent(
      query
    )}&cod_centro=${cod_centro}&skip=${skip}&limit=${limit}`;
    const data = await apiClient(endpoint, "GET");

    // Validación para asegurar que la respuesta tenga el formato esperado
    if (
      data &&
      typeof data === "object" &&
      Array.isArray(data.items) &&
      typeof data.total_items === "number"
    ) {
      return data;
    } else {
      console.warn(
        "La respuesta del servidor no tiene el formato esperado:",
        data
      );
      return { items: [], total_items: 0 };
    }
  } catch (error) {
    console.error(`Error en la búsqueda avanzada de grupos:`, error);
    throw error;
  }
};

/**
 * Función para obtener un grupo específico por su código de ficha
 * @param cod_ficha - Código de la ficha a buscar
 * @returns Promise con los datos del grupo
 */
const getGrupoByFicha = async (cod_ficha: number): Promise<Grupo> => {
  try {
    const endpoint = `/grupos/${cod_ficha}`;
    const grupoData = await apiClient(endpoint, "GET");
    return grupoData;
  } catch (error) {
    console.error(`Error al obtener el grupo con ficha ${cod_ficha}:`, error);
    throw error;
  }
};

/**
 * Función para actualizar los detalles de un grupo
 * @param cod_ficha - Código de la ficha del grupo a actualizar
 * @param payload - Datos a actualizar (hora_inicio, hora_fin, id_ambiente)
 * @returns Promise con la respuesta del servidor
 */
const updateGrupo = async (
  cod_ficha: number,
  payload: UpdateGrupoPayload
): Promise<any> => {
  try {
    const endpoint = `/grupos/${cod_ficha}`;
    const response = await apiClient(endpoint, "PUT", { body: payload });
    return response;
  } catch (error) {
    console.error(`Error al actualizar el grupo ${cod_ficha}:`, error);
    throw error;
  }
};

/**
 * Función para buscar grupos por texto de búsqueda (para select/autocompletar)
 * @param query - Texto de búsqueda para filtrar los grupos
 * @param limit - Número máximo de resultados (opcional, por defecto 20)
 * @returns Promise con la lista de grupos que coinciden con la búsqueda
 */
const searchGrupos = async (
  query: string,
  limit: number = 20
): Promise<Grupo[]> => {
  try {
    const endpoint = `/grupos/search?search=${encodeURIComponent(
      query
    )}&limit=${limit}`;
    const gruposData = await apiClient(endpoint, "GET");
    
    // Mapear la respuesta a la interfaz Grupo completa
    const gruposMapeados: Grupo[] = gruposData.map((grupo: any) => ({
      cod_ficha: grupo.cod_ficha,
      estado_grupo: grupo.estado_grupo,
      jornada: grupo.jornada,
      fecha_inicio: grupo.fecha_inicio,
      fecha_fin: grupo.fecha_fin,
      etapa: grupo.etapa,
      responsable: grupo.responsable,
      nombre_programa: grupo.nombre_programa,
      nombre_ambiente: grupo.nombre_ambiente,
      // Mapear otros campos que puedan estar disponibles
      modalidad: grupo.modalidad || null,
      nombre_municipio: grupo.nombre_municipio || null,
      nombre_nivel: grupo.nombre_nivel || null,
      cod_centro: grupo.cod_centro || null,
      cod_programa: grupo.cod_programa || null,
      la_version: grupo.la_version || null,
      hora_inicio: grupo.hora_inicio || null,
      hora_fin: grupo.hora_fin || null,
      id_ambiente: grupo.id_ambiente || null,
      nombre_empresa: grupo.nombre_empresa || null,
      nombre_programa_especial: grupo.nombre_programa_especial || null,
    }));
    
    return gruposMapeados;
  } catch (error) {
    console.error(`Error al buscar grupos con query "${query}":`, error);
    throw error;
  }
};

/**
 * Función para obtener las fichas asignadas a un instructor
 * @param idInstructor - ID del instructor
 * @returns Promise con la lista de grupos asignados al instructor
 */
const getGruposPorInstructor = async (
  idInstructor: number
): Promise<Grupo[]> => {
  try {
    // Obtener directamente la información completa desde el endpoint
    const endpoint = `/grupo-instructor/instructor/${idInstructor}`;
    const gruposCompletos: GrupoInstructorCompleto[] = await apiClient(
      endpoint,
      "GET"
    );

    if (!gruposCompletos || gruposCompletos.length === 0) {
      return [];
    }

    // Para cada grupo, obtener información adicional necesaria para competencias
    const grupos: Grupo[] = [];

    for (const grupoCompleto of gruposCompletos) {
      try {
        // Obtener información adicional del grupo (incluyendo cod_programa y la_version)
        const grupoDetallado = await getGrupoByFicha(grupoCompleto.cod_ficha);

        // Combinar la información del endpoint optimizado con los detalles adicionales
        const grupoFinal: Grupo = {
          cod_ficha: grupoCompleto.cod_ficha,
          estado_grupo: grupoCompleto.estado_grupo,
          jornada: grupoCompleto.jornada,
          fecha_inicio: grupoCompleto.fecha_inicio,
          fecha_fin: grupoCompleto.fecha_fin,
          etapa: grupoCompleto.etapa,
          nombre_programa: grupoCompleto.nombre_programa,
          nombre_municipio: grupoCompleto.nombre_centro,
          // Campos adicionales necesarios para competencias
          cod_programa: grupoDetallado.cod_programa,
          la_version: grupoDetallado.la_version,
          cod_centro: grupoDetallado.cod_centro,
          hora_inicio: grupoDetallado.hora_inicio,
          hora_fin: grupoDetallado.hora_fin,
          // Otros campos que puedan ser útiles
          modalidad: grupoDetallado.modalidad,
          responsable: grupoDetallado.responsable,
          id_ambiente: grupoDetallado.id_ambiente,
        };

        grupos.push(grupoFinal);
      } catch (error) {
        console.error(
          `❌ [ERROR] Error al obtener detalles del grupo ${grupoCompleto.cod_ficha}:`,
          error
        );

        // En caso de error, usar solo la información básica disponible
        const grupoBasico: Grupo = {
          cod_ficha: grupoCompleto.cod_ficha,
          estado_grupo: grupoCompleto.estado_grupo,
          jornada: grupoCompleto.jornada,
          fecha_inicio: grupoCompleto.fecha_inicio,
          fecha_fin: grupoCompleto.fecha_fin,
          etapa: grupoCompleto.etapa,
          nombre_programa: grupoCompleto.nombre_programa,
          nombre_municipio: grupoCompleto.nombre_centro,
        };

        grupos.push(grupoBasico);
      }
    }

    return grupos;
  } catch (error) {
    console.error(
      `Error al obtener grupos para el instructor ${idInstructor}:`,
      error
    );
    throw error;
  }
};

/**
 * Función para asignar un instructor a una ficha
 * @param payload - Datos de la asignación (cod_ficha, id_instructor)
 * @returns Promise con la respuesta del servidor
 */
const asignarInstructorAFicha = async (
  payload: GrupoInstructor
): Promise<GrupoInstructor> => {
  try {
    const endpoint = "/grupo-instructor/";
    const response = await apiClient(endpoint, "POST", { body: payload });
    return response;
  } catch (error) {
    console.error("Error al asignar instructor a ficha:", error);
    throw error;
  }
};

// --- Servicios del Dashboard ---

/**
 * Función auxiliar para construir los parámetros de consulta de la URL
 * @param filters - Objeto con los filtros a aplicar
 * @returns Un string con los parámetros para la URL
 */
const buildDashboardQueryParams = (filters: DashboardFilters): string => {
  const params = new URLSearchParams();

  // Obtener cod_centro del localStorage desde user_data
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user?.cod_centro) {
        params.append("cod_centro", user.cod_centro.toString());
      }
    } catch (error) {
      console.error("Error parsing user_data from localStorage:", error);
    }
  }

  params.append("estado_grupo", filters.estado_grupo);
  if (filters.año) {
    params.append("año", filters.año.toString());
  }
  if (filters.nombre_nivel) {
    params.append("nombre_nivel", filters.nombre_nivel);
  }
  if (filters.etapa) {
    params.append("etapa", filters.etapa);
  }
  if (filters.modalidad) {
    params.append("modalidad", filters.modalidad);
  }
  if (filters.jornada) {
    params.append("jornada", filters.jornada);
  }
  if (filters.nombre_municipio) {
    params.append("nombre_municipio", filters.nombre_municipio);
  }
  return params.toString();
};

const getDashboardKPIs = async (
  filters: DashboardFilters
): Promise<DashboardKPI> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/kpis?${queryParams}`;
    return await apiClient(endpoint, "GET");
  } catch (error) {
    console.error("Error al obtener los KPIs del dashboard:", error);
    throw error;
  }
};

const getDistribucionPorMunicipio = async (
  filters: DashboardFilters
): Promise<DistribucionMunicipio[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-municipio?${queryParams}`;
    return await apiClient(endpoint, "GET");
  } catch (error) {
    console.error("Error al obtener la distribución por municipio:", error);
    throw error;
  }
};

const getDistribucionPorJornada = async (
  filters: DashboardFilters
): Promise<DistribucionJornada[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-jornada?${queryParams}`;
    return await apiClient(endpoint, "GET");
  } catch (error) {
    console.error("Error al obtener la distribución por jornada:", error);
    throw error;
  }
};

const getDistribucionPorModalidad = async (
  filters: DashboardFilters
): Promise<DistribucionModalidad[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-modalidad?${queryParams}`;
    return await apiClient(endpoint, "GET");
  } catch (error) {
    console.error("Error al obtener la distribución por modalidad:", error);
    throw error;
  }
};

const getDistribucionPorEtapa = async (
  filters: DashboardFilters
): Promise<DistribucionEtapa[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-etapa?${queryParams}`;
    return await apiClient(endpoint, "GET");
  } catch (error) {
    console.error("Error al obtener la distribución por etapa:", error);
    throw error;
  }
};

const getDistribucionPorNivel = async (
  filters: DashboardFilters
): Promise<DistribucionNivel[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-nivel?${queryParams}`;
    return await apiClient(endpoint, "GET");
  } catch (error) {
    console.error("Error al obtener la distribución por nivel:", error);
    throw error;
  }
};

// Exportar las funciones como un objeto grupoService
export const grupoService = {
  getGruposByCentro,
  advancedSearchGrupos,
  getGrupoByFicha,
  updateGrupo,
  searchGrupos,
  getGruposPorInstructor,
  asignarInstructorAFicha,
  // Nuevos servicios de Dashboard
  getDashboardKPIs,
  getDistribucionPorMunicipio,
  getDistribucionPorJornada,
  getDistribucionPorModalidad,
  getDistribucionPorEtapa,
  getDistribucionPorNivel,
};
