import { apiClient } from "./apiClient";
import { User } from "./user.service";

// Interfaz para describir la estructura de la respuesta exitosa del login
export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name?: string;
    [key: string]: any; // Permitir propiedades adicionales del usuario
  };
  access_token: string;
}

/**
 * Función para realizar el login del usuario
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Promise con los datos de la respuesta del login
 */
const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Crear el cuerpo de la petición en formato x-www-form-urlencoded
    const body = {
      username: email, // La API espera 'username' en lugar de 'email'
      password: password,
    };

    // Realizar la petición de login con la cabecera Content-Type correcta
    const response = await apiClient("/access/token", "POST", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    // Guardar el token y los datos del usuario en localStorage
    if (response.access_token) {
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user_data", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    // Re-lanzar el error con un mensaje más descriptivo si es necesario
    throw error;
  }
};

/**
 * Función para realizar el logout del usuario
 * Elimina el token de acceso y los datos del usuario del localStorage
 */
const logout = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_data");
};

/**
 * Función para obtener el token almacenado en localStorage
 * @returns El token de acceso o null si no existe
 */
const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

/**
 * Función para obtener los datos del usuario almacenados en localStorage
 * @returns Los datos del usuario o null si no existen
 */
const getUserData = (): LoginResponse["user"] | null => {
  const userData = localStorage.getItem("user_data");
  return userData ? JSON.parse(userData) : null;
};

/**
 * Función para verificar si el usuario está autenticado
 * @returns true si hay un token válido, false en caso contrario
 */
const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Función para actualizar los datos del usuario en localStorage
 * @param updatedData - Datos parciales del usuario a actualizar
 */
const updateLocalUserData = (updatedData: Partial<User>): void => {
  // Obtener los datos actuales del usuario desde localStorage
  const currentUserData = localStorage.getItem("user_data");

  if (currentUserData) {
    try {
      // Parsear los datos actuales del usuario
      const currentUser = JSON.parse(currentUserData);

      // Fusionar los datos antiguos con los nuevos (los nuevos sobrescriben a los viejos)
      const updatedUser = { ...currentUser, ...updatedData };

      // Guardar el nuevo objeto fusionado de vuelta en localStorage
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
    } catch (error) {
      console.error(
        "Error al actualizar los datos del usuario en localStorage:",
        error
      );
    }
  }
};

// Exportar las funciones como un objeto authService
export const authService = {
  login,
  logout,
  getToken,
  getUserData,
  isAuthenticated,
  updateLocalUserData,
};
