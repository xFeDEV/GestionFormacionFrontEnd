import { apiClient } from "./apiClient";

// Interfaz para la respuesta del endpoint GET /grupo-instructor/grupo/{cod_ficha}
export interface InstructorDeGrupo {
  cod_ficha: number;
  id_instructor: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  tipo_contrato: string;
  nombre_rol: string;
}

// Interfaz para la respuesta del endpoint GET /grupo-instructor/instructor/{id_instructor}
export interface GrupoDeInstructor {
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

// Interfaz para las peticiones POST y PUT
export interface AsignacionGrupoInstructor {
  cod_ficha: number;
  id_instructor: number;
}

/**
 * Función para obtener todos los instructores asignados a un grupo específico
 * @param codFicha - Código de la ficha del grupo
 * @returns Promise con la lista de instructores asignados al grupo
 */
const getInstructoresPorGrupo = async (
  codFicha: number
): Promise<InstructorDeGrupo[]> => {
  try {
    const endpoint = `/grupo-instructor/grupo/${codFicha}`;
    const instructores = await apiClient(endpoint, "GET");
    return instructores;
  } catch (error) {
    console.error(
      `Error al obtener instructores del grupo ${codFicha}:`,
      error
    );
    throw error;
  }
};

/**
 * Función para obtener todos los grupos asignados a un instructor específico
 * @param idInstructor - ID del instructor
 * @returns Promise con la lista de grupos asignados al instructor
 */
const getGruposPorInstructor = async (
  idInstructor: number
): Promise<GrupoDeInstructor[]> => {
  try {
    const endpoint = `/grupo-instructor/instructor/${idInstructor}`;
    const grupos = await apiClient(endpoint, "GET");
    return grupos;
  } catch (error) {
    console.error(
      `Error al obtener grupos del instructor ${idInstructor}:`,
      error
    );
    throw error;
  }
};

/**
 * Función para asignar un instructor a un grupo
 * @param codFicha - Código de la ficha del grupo
 * @param idInstructor - ID del instructor a asignar
 * @returns Promise con la respuesta de la asignación
 */
const asignarInstructorAGrupo = async (
  codFicha: number,
  idInstructor: number
): Promise<AsignacionGrupoInstructor> => {
  try {
    console.log("🔍 [DEBUG] Datos para asignación:", { codFicha, idInstructor });
    
    const endpoint = "/grupo-instructor/";
    const payload: AsignacionGrupoInstructor = {
      cod_ficha: codFicha,
      id_instructor: idInstructor,
    };
    
    console.log("🔍 [DEBUG] Payload enviado:", payload);
    console.log("🔍 [DEBUG] Endpoint:", endpoint);
    
    const response = await apiClient(endpoint, "POST", { body: payload });
    console.log("✅ [DEBUG] Respuesta exitosa:", response);
    return response;
  } catch (error) {
    console.error("❌ [ERROR] Error completo:", error);
    console.error(
      `❌ [ERROR] Error al asignar instructor ${idInstructor} al grupo ${codFicha}:`,
      error
    );
    throw error;
  }
};

/**
 * Función para actualizar la asignación de un instructor en un grupo
 * @param codFichaActual - Código actual de la ficha del grupo
 * @param idInstructorActual - ID actual del instructor
 * @param nuevaAsignacion - Nueva asignación (cod_ficha e id_instructor)
 * @returns Promise con la respuesta de la actualización
 */
const actualizarAsignacionInstructor = async (
  codFichaActual: number,
  idInstructorActual: number,
  nuevaAsignacion: AsignacionGrupoInstructor
): Promise<AsignacionGrupoInstructor> => {
  try {
    const endpoint = `/grupo-instructor/${codFichaActual}/${idInstructorActual}`;
    const response = await apiClient(endpoint, "PUT", { body: nuevaAsignacion });
    return response;
  } catch (error) {
    console.error(
      `Error al actualizar asignación del instructor ${idInstructorActual} en grupo ${codFichaActual}:`,
      error
    );
    throw error;
  }
};

/**
 * Función para desasignar un instructor de un grupo
 * @param codFicha - Código de la ficha del grupo
 * @param idInstructor - ID del instructor a desasignar
 * @returns Promise con la respuesta de la desasignación
 */
const desasignarInstructorDeGrupo = async (
  codFicha: number,
  idInstructor: number
): Promise<void> => {
  try {
    console.log("🔍 [DEBUG] Datos para desasignación:", { codFicha, idInstructor });
    
    const endpoint = `/grupo-instructor/${codFicha}/${idInstructor}`;
    console.log("🔍 [DEBUG] Endpoint DELETE:", endpoint);
    
    const response = await apiClient(endpoint, "DELETE");
    console.log("✅ [DEBUG] Respuesta DELETE exitosa:", response);
    
    // La respuesta de DELETE puede ser null (204 No Content), lo cual es correcto
    return;
  } catch (error) {
    console.error("❌ [ERROR] Error completo en DELETE:", error);
    console.error(
      `❌ [ERROR] Error al desasignar instructor ${idInstructor} del grupo ${codFicha}:`,
      error
    );
    throw error;
  }
};

// Exportar las funciones como un objeto grupoInstructorService
export const grupoInstructorService = {
  getInstructoresPorGrupo,
  getGruposPorInstructor,
  asignarInstructorAGrupo,
  actualizarAsignacionInstructor,
  desasignarInstructorDeGrupo,
};
