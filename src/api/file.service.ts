import { apiClient } from './apiClient';

/**
 * Función para subir un archivo Excel al servidor
 * @param file - Archivo Excel a subir (tipo File)
 * @returns Promise con la respuesta del servidor
 */
const uploadExcelFile = async (file: File): Promise<any> => {
  try {
    // Crear FormData y añadir el archivo con la clave "file"
    const formData = new FormData();
    formData.append('file', file);

    // Usar apiClient - detecta automáticamente FormData y maneja headers correctamente
    // El apiClient se encarga de añadir el token de autorización y manejar multipart/form-data
    const response = await apiClient('/files/upload-excel/', 'POST', {
      body: formData
    });

    return response;
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

// Exportar las funciones como un objeto fileService
export const fileService = {
  uploadExcelFile
}; 