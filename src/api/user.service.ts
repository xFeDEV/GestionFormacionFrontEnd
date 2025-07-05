import { apiClient } from './apiClient';

// Interfaz para describir la estructura de los datos del usuario
export interface User {
  id: number;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Permitir propiedades adicionales del usuario
}

/**
 * Función para obtener los datos del usuario autenticado
 * Utiliza el token almacenado automáticamente a través de apiClient
 * @returns Promise con los datos del usuario
 */
const getMe = async (): Promise<User> => {
  try {
    // Realizar petición GET al endpoint /users/me
    // El apiClient se encarga de añadir automáticamente el token de autorización
    const userData = await apiClient('/users/me', 'GET');
    
    // Actualizar los datos del usuario en localStorage si es necesario
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    
    return userData;
  } catch (error) {
    // Manejar errores específicos de autorización
    if (error instanceof Error && 'status' in error && (error as any).status === 401) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    // Re-lanzar cualquier otro error
    throw error;
  }
};

/**
 * Función para refrescar los datos del usuario
 * Alias de getMe para mayor claridad semántica
 * @returns Promise con los datos actualizados del usuario
 */
const refreshUserData = async (): Promise<User> => {
  return await getMe();
};

// Exportar las funciones como un objeto userService
export const userService = {
  getMe,
  refreshUserData
};
