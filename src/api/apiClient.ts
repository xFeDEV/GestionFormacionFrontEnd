// Configuración base de la API
//const baseURL = "http://localhost:8000";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "https://api.gestionformacion.tech";

// Tipos para mayor robustez
interface ApiClientOptions {
  body?: any;
  headers?: Record<string, string>;
}

interface ApiError extends Error {
  status: number;
  statusText: string;
}

/**
 * Cliente de API centralizado para manejar todas las comunicaciones con el backend
 * Añade automáticamente el token de autenticación y maneja errores de forma consistente
 */
export const apiClient = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  options: ApiClientOptions = {}
): Promise<any> => {
  try {
    // Obtener el token de acceso desde localStorage
    const accessToken = localStorage.getItem("access_token");

    // Construir las cabeceras base
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Añadir cabecera de autorización si hay token disponible
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Preparar el cuerpo de la petición
    let body: string | FormData | undefined;
    if (options.body) {
      // Si el body ya es FormData (para subida de archivos), usarlo directamente
      if (options.body instanceof FormData) {
        body = options.body;
        // Remover Content-Type para que el navegador establezca multipart/form-data con boundary
        delete headers["Content-Type"];
      }
      // Si el header es application/x-www-form-urlencoded, convertir a FormData
      else if (
        headers["Content-Type"] === "application/x-www-form-urlencoded"
      ) {
        const formData = new URLSearchParams();
        Object.keys(options.body).forEach((key) => {
          formData.append(key, options.body[key]);
        });
        body = formData.toString();
      } else {
        body = JSON.stringify(options.body);
      }
    }

    // Realizar la llamada fetch
    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers,
      body,
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        // Intentar obtener detalles del error desde la respuesta
        const errorData = await response.json();
        errorMessage =
          errorData.detail ||
          errorData.message ||
          errorData.error ||
          JSON.stringify(errorData);
      } catch {
        // Si no se puede parsear como JSON, usar el statusText
        errorMessage = response.statusText || errorMessage;
      }

      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    // Para respuestas sin contenido (204 No Content), devolver null
    if (response.status === 204) {
      return null;
    }

    // Verificar si la respuesta tiene contenido JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Si no es JSON, devolver texto plano o null
    const text = await response.text();
    return text || null;
  } catch (error) {
    // Manejar errores de red y otros errores
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Error de conexión de red. Verifica tu conexión a internet."
      );
    }

    // Re-lanzar el error si ya es un error de API o cualquier otro error
    throw error;
  }
};

/**
 * Función auxiliar para limpiar el token de localStorage
 * Útil para logout o cuando el token expira
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_data");
};

/**
 * Función auxiliar para verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};
