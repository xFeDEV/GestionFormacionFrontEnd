import { apiClient } from './apiClient';

// Interfaz para describir la estructura de los datos del ambiente
export interface Ambiente {
    id_ambiente?: number;
    nombre_ambiente: string;
    num_max_aprendices: number;
    municipio: string;
    ubicacion: string;
    cod_centro: number;
    estado: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: any; // Permitir propiedades adicionales del ambiente
}

// Interfaz para los datos que se pueden actualizar del ambiente
export interface UpdateAmbientePayload {
    nombre_ambiente?: string;
    num_max_aprendices?: number;
    municipio?: string;
    ubicacion?: string;
    cod_centro?: number;
    estado?: boolean;
}

// Interfaz para los datos necesarios para crear un nuevo ambiente
export interface CreateAmbientePayload {
    nombre_ambiente: string;
    num_max_aprendices: number;
    municipio: string;
    ubicacion: string;
    cod_centro: number;
    estado: boolean;
}

/**
 * Función para obtener un ambiente específico por ID
 * @param ambiente_id - ID del ambiente a obtener
 * @returns Promise con los datos del ambiente
 */
const getAmbienteById = async (ambiente_id: number): Promise<Ambiente> => {
    try {
        // Realizar petición GET al endpoint /ambientes/{ambiente_id}
        // El apiClient se encarga de añadir automáticamente el token de autorización
        const ambienteData = await apiClient(`/ambientes/${ambiente_id}`, 'GET');

        return ambienteData;
    } catch (error) {
        // Manejar errores específicos de autorización
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
            // Token expirado o inválido, limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // Manejar errores 405 específicamente
        if (error instanceof Error && 'status' in error && (error as any).status === 405) {
            throw new Error('Método HTTP no permitido para este endpoint. Verifica la configuración de la API.');
        }

        // Re-lanzar cualquier otro error
        throw error;
    }
};

/**
 * Función para obtener ambientes activos por centro
 * @param cod_centro - Código del centro para filtrar ambientes activos
 * @returns Promise con la lista de ambientes activos del centro
 */
const getAmbientesActivosByCentro = async (cod_centro: number): Promise<Ambiente[]> => {
    try {
        // Realizar petición GET al endpoint /ambientes/activos/centro/{cod_centro}
        // El apiClient se encarga de añadir automáticamente el token de autorización
        const ambientesData = await apiClient(`/ambientes/activos/centro/${cod_centro}`, 'GET');

        return ambientesData;
    } catch (error) {
        // Manejar errores específicos de autorización
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
            // Token expirado o inválido, limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // Manejar errores 405 específicamente
        if (error instanceof Error && 'status' in error && (error as any).status === 405) {
            throw new Error('Método HTTP no permitido para este endpoint. Verifica la configuración de la API.');
        }

        // Re-lanzar cualquier otro error
        throw error;
    }
};

/**
 * Función para crear un nuevo ambiente
 * @param payload - Datos del nuevo ambiente a crear
 * @returns Promise con los datos del ambiente creado
 */
const createAmbiente = async (payload: CreateAmbientePayload): Promise<Ambiente> => {
    try {
        // Realizar petición POST al endpoint /ambientes/
        // El apiClient se encarga de añadir automáticamente el token de autorización
        // y el Content-Type: application/json
        const newAmbiente = await apiClient('/ambientes/', 'POST', { body: payload });

        return newAmbiente;
    } catch (error) {
        // Manejar errores específicos de autorización
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
            // Token expirado o inválido, limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // Manejar errores 405 específicamente
        if (error instanceof Error && 'status' in error && (error as any).status === 405) {
            throw new Error('Método HTTP no permitido para este endpoint. Verifica la configuración de la API.');
        }

        // Re-lanzar cualquier otro error
        throw error;
    }
};

/**
 * Función para actualizar los datos de un ambiente
 * @param ambiente_id - ID del ambiente a actualizar
 * @param payload - Datos a actualizar del ambiente
 * @returns Promise con la respuesta del servidor
 */
const updateAmbiente = async (ambiente_id: number, payload: UpdateAmbientePayload): Promise<Ambiente> => {
    try {
        // Realizar petición PUT al endpoint /ambientes/{ambiente_id}
        // El apiClient se encarga de añadir automáticamente el token de autorización
        // y el Content-Type: application/json
        const updatedAmbiente = await apiClient(`/ambientes/${ambiente_id}`, 'PUT', { body: payload });

        return updatedAmbiente;
    } catch (error) {
        // Manejar errores específicos de autorización
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
            // Token expirado o inválido, limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // Manejar errores 405 específicamente
        if (error instanceof Error && 'status' in error && (error as any).status === 405) {
            throw new Error('Método HTTP no permitido para este endpoint. Verifica la configuración de la API.');
        }

        // Re-lanzar cualquier otro error
        throw error;
    }
};



/**
 * Función para cambiar el estado de un ambiente (toggle)
 * @param ambiente_id - ID del ambiente a cambiar estado
 * @returns Promise con la respuesta del servidor
 */
const toggleEstadoAmbiente = async (ambiente_id: number): Promise<void> => {
    try {
        // Realizar petición PUT al endpoint /ambientes/toggle-estado/{ambiente_id}
        // El apiClient se encarga de añadir automáticamente el token de autorización
        await apiClient(`/ambientes/toggle-estado/${ambiente_id}`, 'PUT');
    } catch (error) {
        // Manejar errores específicos de autorización
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
            // Token expirado o inválido, limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // Manejar errores 405 específicamente
        if (error instanceof Error && 'status' in error && (error as any).status === 405) {
            throw new Error('Método HTTP no permitido para este endpoint. Verifica la configuración de la API.');
        }

        // Re-lanzar cualquier otro error
        throw error;
    }
};

// Exportar las funciones como un objeto ambienteService
export const ambienteService = {
    getAmbienteById,
    getAmbientesActivosByCentro,
    createAmbiente,
    updateAmbiente,
    toggleEstadoAmbiente
};
