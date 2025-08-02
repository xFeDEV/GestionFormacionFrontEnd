import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificacionService, Notificacion } from '../api/notificacion.service';

// Tipos para el contexto
interface NotificationContextType {
  notificaciones: Notificacion[];
  conteoNoLeidas: number;
  loading: boolean;
  error: string | null;
  fetchNotificaciones: () => Promise<void>;
  marcarComoLeida: (id_notificacion: number) => Promise<void>;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Props para el provider
interface NotificationProviderProps {
  children: ReactNode;
}

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Estados
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para obtener notificaciones del servidor
   */
  const fetchNotificaciones = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificacionService.getNotificaciones();
      
      // Verificar si la respuesta es un array directo o el formato esperado
      let notificacionesArray: Notificacion[] = [];
      let noLeidasCount = 0;

      if (Array.isArray(response)) {
        // Si la respuesta es un array directo
        notificacionesArray = response;
        noLeidasCount = response.filter(n => !n.leida).length;
      } else if (response && typeof response === 'object') {
        // Si la respuesta tiene el formato esperado
        notificacionesArray = response.notificaciones || [];
        noLeidasCount = response.no_leidas || notificacionesArray.filter(n => !n.leida).length;
      } else {
        notificacionesArray = [];
        noLeidasCount = 0;
      }

      // Actualizar estados
      setNotificaciones(notificacionesArray);
      setConteoNoLeidas(noLeidasCount);

    } catch (error: any) {
      console.error("❌ [NotificationContext] Error al obtener notificaciones:", error);
      setError(error.message || 'Error al cargar notificaciones');
      
      // En caso de error, mantener estados previos o establecer valores por defecto
      if (notificaciones.length === 0) {
        setNotificaciones([]);
        setConteoNoLeidas(0);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para marcar una notificación como leída
   * @param id_notificacion ID de la notificación a marcar como leída
   */
  const marcarComoLeida = async (id_notificacion: number): Promise<void> => {
    try {
      // Llamar al servicio para marcar como leída
      await notificacionService.marcarNotificacionComoLeida(id_notificacion);
      
      // Actualizar inmediatamente el estado local para feedback rápido
      setNotificaciones(prevNotificaciones => 
        (prevNotificaciones || []).map(notif => 
          notif.id_notificacion === id_notificacion 
            ? { ...notif, leida: true, fecha_leida: new Date().toISOString() }
            : notif
        )
      );

      // Recalcular el conteo de no leídas
      setConteoNoLeidas(prevConteo => Math.max(0, prevConteo - 1));

      // Volver a obtener las notificaciones actualizadas del servidor
      await fetchNotificaciones();

    } catch (error: any) {
      console.error("❌ [NotificationContext] Error al marcar notificación como leída:", error);
      setError(error.message || 'Error al marcar notificación como leída');
      throw error; // Re-lanzar para que el componente pueda manejarlo si es necesario
    }
  };

  // Effect para cargar notificaciones al montar el componente y configurar polling
  useEffect(() => {
    // Cargar notificaciones inmediatamente
    fetchNotificaciones();

    // Configurar polling cada 5 segundos para actualizaciones en tiempo real
    const intervalId = setInterval(() => {
      fetchNotificaciones();
    }, 10000); // 5 segundos

    // Cleanup function para limpiar el interval
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Solo ejecutar una vez al montar

  // Valor del contexto
  const contextValue: NotificationContextType = {
    notificaciones,
    conteoNoLeidas,
    loading,
    error,
    fetchNotificaciones,
    marcarComoLeida,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de notificaciones
 * @returns NotificationContextType
 * @throws Error si se usa fuera del NotificationProvider
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  
  return context;
};

// Exportar el contexto por si se necesita acceso directo (aunque se recomienda usar el hook)
export { NotificationContext };
