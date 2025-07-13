import { apiClient } from './apiClient';

// INTERFAZ DE DATOS (cómo se ven los datos que recibimos)
export interface Program {
  cod_programa: number;
  la_version: number;
  nombre: string;
  horas_lectivas: number;
  horas_productivas: number;
  // Añadimos opcionalmente otros campos que puedan venir
  id?: number;
  estado?: boolean;
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
 * Obtiene todos los programas de formación desde el backend.
 */
const getAllPrograms = async (): Promise<Program[]> => {
  try {
    const programs = await apiClient('/programas/programas/', 'GET');
    return programs;
  } catch (error) {
    console.error("Error al obtener los programas:", error);
    throw error;
  }
};

/**
 * Crea un nuevo programa de formación.
 */
const createProgram = async (payload: CreateProgramPayload): Promise<Program> => {
  try {
    // Usamos el endpoint de creación y enviamos el payload con la estructura correcta.
    const newProgram = await apiClient('/programas/programas/', 'POST', { body: payload });
    return newProgram;
  } catch (error) {
    console.error("Error al crear el programa:", error);
    throw error;
  }
};

/**
 * Actualiza las horas de un programa existente.
 */
const updateProgram = async (programId: number, payload: UpdateProgramPayload): Promise<Program> => {
  try {
    // Usamos el endpoint de actualización y enviamos solo las horas.
    const updatedProgram = await apiClient(`/programas/programas/${programId}`, 'PUT', { body: payload });
    return updatedProgram;
  } catch (error) {
    console.error("Error al actualizar el programa:", error);
    throw error;
  }
};

// Exportamos todo en nuestro objeto de servicio.
export const programService = {
  getAllPrograms,
  createProgram,
  updateProgram,
};
