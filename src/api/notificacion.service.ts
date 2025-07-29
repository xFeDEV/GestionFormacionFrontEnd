import { apiClient } from './apiClient';

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
  fecha_leida?: string | null;
  leida: boolean;
  datos_adicionales?: any;
}

export interface NotificacionesResponse {
  notificaciones: Notificacion[];
  total: number;
  no_leidas: number;
}

export const notificacionService = {
  /**
   * Obtiene todas las notificaciones del usuario autenticado
   * @returns Promise<NotificacionesResponse>
   */
  getNotificaciones: async (): Promise<NotificacionesResponse> => {
    console.log("🔔 [DEBUG] Obteniendo notificaciones del usuario...");
    
    try {
      const response = await apiClient('/notificaciones/', 'GET');
      
      console.log("📊 [DEBUG] Respuesta del API:", response);
      
      // Verificar el formato de la respuesta
      if (Array.isArray(response)) {
        // Si la respuesta es un array directo, convertir al formato esperado
        console.log("📊 [DEBUG] Respuesta es array directo, convirtiendo formato...");
        const notificaciones = response as Notificacion[];
        const noLeidas = notificaciones.filter(n => !n.leida).length;
        
        const formattedResponse: NotificacionesResponse = {
          notificaciones: notificaciones,
          total: notificaciones.length,
          no_leidas: noLeidas
        };
        
        console.log("📊 [DEBUG] Formato convertido:", formattedResponse);
        return formattedResponse;
      } else if (response && typeof response === 'object' && 'notificaciones' in response) {
        // Si ya tiene el formato correcto
        console.log("📊 [DEBUG] Respuesta ya tiene formato correcto");
        console.log("📊 [DEBUG] Total de notificaciones:", response.total);
        console.log("📊 [DEBUG] Notificaciones no leídas:", response.no_leidas);
        return response as NotificacionesResponse;
      } else {
        // Respuesta inesperada, devolver formato vacío
        console.log("⚠️ [DEBUG] Formato de respuesta inesperado, devolviendo formato vacío");
        return {
          notificaciones: [],
          total: 0,
          no_leidas: 0
        };
      }
    } catch (error) {
      console.error("❌ [ERROR] Error al obtener notificaciones:", error);
      throw error;
    }
  },

  /**
   * Marca una notificación específica como leída
   * @param id_notificacion ID de la notificación a marcar como leída
   * @returns Promise<void>
   */
  marcarNotificacionComoLeida: async (id_notificacion: number): Promise<void> => {
    console.log("✅ [DEBUG] Marcando notificación como leída:", id_notificacion);
    
    try {
      await apiClient(`/notificaciones/${id_notificacion}/leer`, 'PUT');
      
      console.log("✅ [DEBUG] Notificación marcada como leída exitosamente");
    } catch (error) {
      console.error("❌ [ERROR] Error al marcar notificación como leída:", error);
      throw error;
    }
  },

  /**
   * Obtiene el número de notificaciones no leídas
   * @returns Promise<number>
   */
  getNotificacionesNoLeidas: async (): Promise<number> => {
    try {
      const response = await notificacionService.getNotificaciones();
      return response.no_leidas;
    } catch (error) {
      console.error("❌ [ERROR] Error al obtener contador de notificaciones no leídas:", error);
      return 0;
    }
  },

  /**
   * Función auxiliar para formatear la fecha de una notificación
   * @param fechaCreacion Fecha de creación en formato ISO
   * @returns string Tiempo transcurrido en formato legible
   */
  formatearTiempoTranscurrido: (fechaCreacion: string): string => {
    // Validar que fechaCreacion sea válida
    if (!fechaCreacion || typeof fechaCreacion !== 'string') {
      console.warn("⚠️ [DEBUG] Fecha de creación inválida:", fechaCreacion);
      return 'Fecha inválida';
    }

    try {
      const ahora = new Date();
      const fechaNotificacion = new Date(fechaCreacion);
      
      // Verificar que la fecha sea válida
      if (isNaN(fechaNotificacion.getTime())) {
        console.warn("⚠️ [DEBUG] Fecha de notificación no válida:", fechaCreacion);
        return 'Fecha inválida';
      }

      const diferencia = ahora.getTime() - fechaNotificacion.getTime();

      // Si la diferencia es negativa (fecha futura), mostrar "Ahora"
      if (diferencia < 0) {
        return 'Ahora';
      }

      const minutos = Math.floor(diferencia / (1000 * 60));
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

      if (minutos < 1) {
        return 'Ahora';
      } else if (minutos < 60) {
        return `${minutos} min ago`;
      } else if (horas < 24) {
        return `${horas} hr ago`;
      } else {
        return `${dias} día${dias > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.error("❌ [DEBUG] Error al formatear tiempo transcurrido:", error);
      return 'Fecha inválida';
    }
  },

  /**
   * Función auxiliar para obtener el ícono según el tipo de notificación
   * @param tipo Tipo de notificación
   * @returns string Emoji o ícono para el tipo
   */
  getIconoPorTipo: (tipo: string): string => {
    // Validar que tipo no sea undefined, null o vacío
    if (!tipo || typeof tipo !== 'string') {
      console.warn("⚠️ [DEBUG] Tipo de notificación inválido:", tipo);
      return '🔔'; // Ícono por defecto
    }

    const iconos: Record<string, string> = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'programacion': '📅',
      'instructor': '👨‍🏫',
      'ficha': '📋',
      'sistema': '⚙️',
      'default': '🔔'
    };

    return iconos[tipo.toLowerCase()] || iconos.default;
  }
};
