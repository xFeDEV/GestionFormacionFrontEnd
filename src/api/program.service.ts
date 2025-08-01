import { apiClient } from "./apiClient";

// INTERFAZ DE DATOS (cómo se ven los datos que recibimos)
export interface Program {
  cod_programa: number;
  la_version: number;
  nombre: string;
  horas_lectivas: number;
  horas_productivas: number;
}

// INTERFAZ PARA CREAR (la forma exacta de los datos para enviar al crear)
export interface CreateProgramPayload {
  cod_programa: number;
  la_version: number;
  nombre: string;
  horas_lectivas: number;
  horas_productivas: number;
}

// INTERFAZ PARA ACTUALIZAR (solo los campos que la API permite modificar)
export interface UpdateProgramPayload {
  horas_lectivas: number;
  horas_productivas: number;
}

/**
 * Obtiene una lista paginada de programas desde el backend.
 */
const getAllPrograms = async (
  skip: number,
  limit: number
): Promise<{ items: Program[]; total_items: number }> => {
  try {
    // Apuntamos al endpoint correcto con los parámetros de paginación
    const endpoint = `/programas/programas/?skip=${skip}&limit=${limit}`;
    const data = await apiClient(endpoint, "GET");

    // Aseguramos una respuesta válida para evitar errores en el frontend.
    if (data && Array.isArray(data.items)) {
      // Normalizamos la respuesta para que siempre tenga total_items
      return {
        items: data.items,
        total_items: data.total || data.total_items || 0,
      };
    }
    // Si la respuesta no es válida, devolvemos una estructura vacía.
    return { items: [], total_items: 0 };
  } catch (error) {
    console.error("Error al obtener los programas paginados:", error);
    throw error;
  }
};

/**
 * Crea un nuevo programa de formación.
 */
const createProgram = async (
  payload: CreateProgramPayload
): Promise<Program> => {
  try {
    const newProgram = await apiClient("/programas/programas/", "POST", {
      body: payload,
    });
    return newProgram;
  } catch (error) {
    console.error("Error al crear el programa:", error);
    throw error;
  }
};

/**
 * Actualiza las horas de un programa existente.
 */
const updateProgram = async (
  programId: number,
  payload: UpdateProgramPayload
): Promise<Program> => {
  try {
    const updatedProgram = await apiClient(
      `/programas/programas/${programId}`,
      "PUT",
      {
        body: payload,
      }
    );
    return updatedProgram;
  } catch (error) {
    console.error("Error al actualizar el programa:", error);
    throw error;
  }
};

/**
 * Busca programas de formación basado en una consulta.
 */
const searchPrograms = async (
  query: string,
  skip: number,
  limit: number
): Promise<{ items: Program[]; total_items: number }> => {
  try {
    const endpoint = `/programas/programas/search/?query=${query}&skip=${skip}&limit=${limit}`;
    const data = await apiClient(endpoint, "GET");

    // Aseguramos una respuesta válida para evitar errores en el frontend.
    if (data && Array.isArray(data.items)) {
      // Normalizamos la respuesta para que siempre tenga total_items
      return {
        items: data.items,
        total_items: data.total || data.total_items || 0,
      };
    }
    // Si la respuesta no es válida, devolvemos una estructura vacía.
    return { items: [], total_items: 0 };
  } catch (error) {
    console.error("Error al buscar programas:", error);
    throw error;
  }
};

// Exportamos todo en nuestro objeto de servicio.
export const programService = {
  getAllPrograms,
  createProgram,
  updateProgram,
  searchPrograms,
};
