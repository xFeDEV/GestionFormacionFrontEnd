import { apiClient } from './apiClient';

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
}

// Coincide con GruposPorMunicipioSchema
export interface DistribucionMunicipio {
  municipio: string;
  cantidad: number;
}

// Coincide con GruposPorJornadaSchema
export interface DistribucionJornada {
  jornada: string;
  cantidad: number;
}

// Coincide con GruposPorModalidadSchema
export interface DistribucionModalidad {
  modalidad: string;
  cantidad: number;
}

// Coincide con GruposPorEtapaSchema
export interface DistribucionEtapa {
  etapa: string;
  cantidad: number;
}

// Coincide con GruposPorNivelSchema
export interface DistribucionNivel {
  nivel: string;
  cantidad: number;
}

/**
 * Función para obtener los grupos por código de centro
 * @param cod_centro - Código del centro para filtrar los grupos
 * @returns Promise con la lista de grupos del centro
 */
const getGruposByCentro = async (cod_centro: number): Promise<Grupo[]> => {
  try {
    const endpoint = `/grupos/centro/${cod_centro}`;
    const gruposData = await apiClient(endpoint, 'GET');
    return gruposData;
  } catch (error) {
    console.error(`Error al obtener grupos para el centro ${cod_centro}:`, error);
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
        const grupoData = await apiClient(endpoint, 'GET');
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
const updateGrupo = async (cod_ficha: number, payload: UpdateGrupoPayload): Promise<any> => {
  try {
    const endpoint = `/grupos/${cod_ficha}`;
    const response = await apiClient(endpoint, 'PUT', { body: payload });
    return response;
  } catch (error) {
    console.error(`Error al actualizar el grupo ${cod_ficha}:`, error);
    throw error;
  }
};

/**
 * Función para buscar grupos por texto de búsqueda
 * @param query - Texto de búsqueda para filtrar los grupos
 * @param limit - Número máximo de resultados (opcional, por defecto 20)
 * @returns Promise con la lista de grupos que coinciden con la búsqueda
 */
const searchGrupos = async (query: string, limit: number = 20): Promise<Grupo[]> => {
  try {
    const endpoint = `/grupos/search?search=${encodeURIComponent(query)}&limit=${limit}`;
    const gruposData = await apiClient(endpoint, 'GET');
    return gruposData;
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
const getGruposPorInstructor = async (idInstructor: number): Promise<Grupo[]> => {
  try {
    // Primero obtener las relaciones grupo-instructor
    const endpoint = `/grupo-instructor/instructor/${idInstructor}`;
    const relaciones: GrupoInstructor[] = await apiClient(endpoint, 'GET');
    
    console.log("📊 [DEBUG] Relaciones grupo-instructor recibidas:", relaciones);
    
    if (!relaciones || relaciones.length === 0) {
      console.log("❌ [DEBUG] No se encontraron fichas para el instructor");
      return [];
    }
    
    // Obtener la información completa de cada grupo
    const gruposCompletos: Grupo[] = [];
    
    for (const relacion of relaciones) {
      try {
        const grupoCompleto = await getGrupoByFicha(relacion.cod_ficha);
        gruposCompletos.push(grupoCompleto);
      } catch (error) {
        console.error(`❌ [ERROR] Error al obtener grupo ${relacion.cod_ficha}:`, error);
        // Continuar con el siguiente grupo en caso de error
      }
    }
    
    console.log("🎯 [DEBUG] Grupos completos obtenidos:", gruposCompletos);
    return gruposCompletos;
    
  } catch (error) {
    console.error(`Error al obtener grupos para el instructor ${idInstructor}:`, error);
    throw error;
  }
};

/**
 * Función para asignar un instructor a una ficha
 * @param payload - Datos de la asignación (cod_ficha, id_instructor)
 * @returns Promise con la respuesta del servidor
 */
const asignarInstructorAFicha = async (payload: GrupoInstructor): Promise<GrupoInstructor> => {
  try {
    const endpoint = '/grupo-instructor/';
    const response = await apiClient(endpoint, 'POST', { body: payload });
    return response;
  } catch (error) {
    console.error('Error al asignar instructor a ficha:', error);
    throw error;
  }
};

// --- Servicios del Dashboard (NUEVO) ---

/**
 * Función auxiliar para construir los parámetros de consulta de la URL
 * @param filters - Objeto con los filtros a aplicar
 * @returns Un string con los parámetros para la URL
 */
const buildDashboardQueryParams = (filters: DashboardFilters): string => {
  const params = new URLSearchParams();
  
  // Obtener cod_centro del localStorage desde user_data
  const userData = localStorage.getItem('user_data');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user?.cod_centro) {
        params.append('cod_centro', user.cod_centro.toString());
      }
    } catch (error) {
      console.error('Error parsing user_data from localStorage:', error);
    }
  }
  
  params.append('estado_grupo', filters.estado_grupo);
  if (filters.año) {
    params.append('año', filters.año.toString());
  }
  if (filters.nombre_nivel) {
    params.append('nombre_nivel', filters.nombre_nivel);
  }
  if (filters.etapa) {
    params.append('etapa', filters.etapa);
  }
  if (filters.modalidad) {
    params.append('modalidad', filters.modalidad);
  }
  if (filters.jornada) {
    params.append('jornada', filters.jornada);
  }
  if (filters.nombre_municipio) {
    params.append('nombre_municipio', filters.nombre_municipio);
  }
  return params.toString();
};

const getDashboardKPIs = async (filters: DashboardFilters): Promise<DashboardKPI> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/kpis?${queryParams}`;
    return await apiClient(endpoint, 'GET');
  } catch (error) {
    console.error('Error al obtener los KPIs del dashboard:', error);
    throw error;
  }
};

const getDistribucionPorMunicipio = async (filters: DashboardFilters): Promise<DistribucionMunicipio[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-municipio?${queryParams}`;
    return await apiClient(endpoint, 'GET');
  } catch (error) {
    console.error('Error al obtener la distribución por municipio:', error);
    throw error;
  }
};

const getDistribucionPorJornada = async (filters: DashboardFilters): Promise<DistribucionJornada[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-jornada?${queryParams}`;
    return await apiClient(endpoint, 'GET');
  } catch (error) {
    console.error('Error al obtener la distribución por jornada:', error);
    throw error;
  }
};

const getDistribucionPorModalidad = async (filters: DashboardFilters): Promise<DistribucionModalidad[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-modalidad?${queryParams}`;
    return await apiClient(endpoint, 'GET');
  } catch (error) {
    console.error('Error al obtener la distribución por modalidad:', error);
    throw error;
  }
};

const getDistribucionPorEtapa = async (filters: DashboardFilters): Promise<DistribucionEtapa[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-etapa?${queryParams}`;
    return await apiClient(endpoint, 'GET');
  } catch (error) {
    console.error('Error al obtener la distribución por etapa:', error);
    throw error;
  }
};

const getDistribucionPorNivel = async (filters: DashboardFilters): Promise<DistribucionNivel[]> => {
  try {
    const queryParams = buildDashboardQueryParams(filters);
    const endpoint = `/grupos/distribucion/por-nivel?${queryParams}`;
    return await apiClient(endpoint, 'GET');
  } catch (error) {
    console.error('Error al obtener la distribución por nivel:', error);
    throw error;
  }
};

// Exportar las funciones como un objeto grupoService
export const grupoService = {
  getGruposByCentro,
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