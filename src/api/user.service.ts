import { apiClient } from "./apiClient";

// Interfaz para describir la estructura de los datos del usuario
export interface User {
  id: number;
  id_usuario?: number; // Campo que viene del API
  nombre_completo: string;
  correo: string;
  nombre_rol?: string;
  estado: boolean;
  cod_centro?: number;
  telefono?: string;
  tipo_contrato?: string;
  identificacion?: string;
  id_rol?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Permitir propiedades adicionales del usuario
}

// Interfaz para los datos que se pueden actualizar del usuario
export interface UpdateUserPayload {
  nombre_completo?: string;
  tipo_contrato?: string;
  telefono?: string;
  correo?: string;
}

// Interfaz para los datos necesarios para crear un nuevo usuario
export interface CreateUserPayload {
  nombre_completo: string;
  identificacion: string;
  id_rol: number;
  correo: string;
  tipo_contrato: string;
  telefono: string;
  estado: boolean;
  cod_centro: number;
  pass_hash: string;
}

// Interfaz para el payload de cambio de contraseña
export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
}

// Interfaz para el payload de restablecimiento de contraseña
export interface ResetPasswordPayload {
  token: string;
  new_password: string;
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
    const userData = await apiClient("/users/me", "GET");

    // Actualizar los datos del usuario en localStorage si es necesario
    if (userData) {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }

    return userData;
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Re-lanzar cualquier otro error
    throw error;
  }
};

/**
 * Función para obtener la lista de usuarios por centro
 * @param cod_centro - Código del centro para filtrar usuarios
 * @returns Promise con la lista de usuarios del centro
 */
const getUsersByCentro = async (cod_centro: number): Promise<User[]> => {
  try {
    // Construir la URL con el query parameter
    const endpoint = `/users/get-by-centro?cod_centro=${cod_centro}`;

    // Realizar petición GET al endpoint con el cod_centro como query parameter
    // El apiClient se encarga de añadir automáticamente el token de autorización
    const usersData = await apiClient(endpoint, "GET");

    return usersData;
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Re-lanzar cualquier otro error
    throw error;
  }
};

/**
 * Función para modificar el estado de un usuario
 * @param userId - ID del usuario a modificar
 * @returns Promise con la respuesta del servidor
 */
const modifyUserStatus = async (userId: number): Promise<void> => {
  try {
    // Realizar petición PUT al endpoint /users/modify-status/{userId}
    // El apiClient se encarga de añadir automáticamente el token de autorización
    await apiClient(`/users/modify-status/${userId}`, "PUT");
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Re-lanzar cualquier otro error
    throw error;
  }
};

/**
 * Función para actualizar los datos de un usuario
 * @param userId - ID del usuario a actualizar
 * @param payload - Datos a actualizar del usuario
 * @returns Promise con la respuesta del servidor
 */
const updateUser = async (
  userId: number,
  payload: UpdateUserPayload
): Promise<User> => {
  try {
    // Realizar petición PUT al endpoint /users/update/{userId}
    // El apiClient se encarga de añadir automáticamente el token de autorización
    // y el Content-Type: application/json
    const updatedUser = await apiClient(`/users/update/${userId}`, "PUT", {
      body: payload,
    });

    return updatedUser;
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Re-lanzar cualquier otro error
    throw error;
  }
};

/**
 * Función para crear un nuevo usuario
 * @param payload - Datos del nuevo usuario a crear
 * @returns Promise con los datos del usuario creado
 */
const createUser = async (payload: CreateUserPayload): Promise<User> => {
  try {
    // Realizar petición POST al endpoint /users/create
    // El apiClient se encarga de añadir automáticamente el token de autorización
    // y el Content-Type: application/json
    const newUser = await apiClient("/users/create", "POST", { body: payload });

    return newUser;
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
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

/**
 * Función para solicitar recuperación de contraseña
 * @param email - Correo electrónico del usuario
 * @returns Promise con la respuesta del servidor
 */
const forgotPassword = async (email: string): Promise<void> => {
  try {
    // Realizar petición POST al endpoint /access/forgot-password
    // El apiClient se encarga de añadir automáticamente el Content-Type: application/json
    await apiClient("/access/forgot-password", "POST", { body: { email } });
  } catch (error) {
    // Re-lanzar cualquier error para que el componente lo maneje
    throw error;
  }
};

/**
 * Función para restablecer la contraseña con un token
 * @param token - Token de restablecimiento recibido por email
 * @param newPassword - Nueva contraseña del usuario
 * @returns Promise con la respuesta del servidor
 */
const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    // Crear el payload usando la interfaz ResetPasswordPayload
    const payload: ResetPasswordPayload = {
      token,
      new_password: newPassword,
    };

    // Realizar petición POST al endpoint /access/reset-password
    // El apiClient se encarga de añadir automáticamente el Content-Type: application/json
    await apiClient("/access/reset-password", "POST", {
      body: payload,
    });
  } catch (error) {
    // Re-lanzar cualquier error para que el componente lo maneje
    throw error;
  }
};

/**
 * Función para cambiar la contraseña del usuario
 * @param payload - Datos con la contraseña actual y nueva
 * @returns Promise con la respuesta del servidor
 */
const updatePassword = async (
  payload: UpdatePasswordPayload
): Promise<void> => {
  try {
    // Realizar petición PUT al endpoint /users/update-password
    // El apiClient se encarga de añadir automáticamente el token de autorización
    // y el Content-Type: application/json
    await apiClient("/users/change-password", "PUT", { body: payload });
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Re-lanzar cualquier otro error
    throw error;
  }
};

/**
 * Función para obtener la lista de instructores
 * @returns Promise con la lista de usuarios que son instructores
 */
const getInstructores = async (): Promise<User[]> => {
  try {
    const endpoint = "/users/instructores";
    const instructoresData = await apiClient(endpoint, "GET");
    return instructoresData;
  } catch (error) {
    // Manejar errores específicos de autorización
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    console.error("Error al obtener la lista de instructores:", error);
    throw error;
  }
};

// Exportar las funciones como un objeto userService
export const userService = {
  getMe,
  getUsersByCentro,
  modifyUserStatus,
  updateUser,
  createUser,
  refreshUserData,
  forgotPassword,
  resetPassword,
  updatePassword,
  getInstructores,
};
