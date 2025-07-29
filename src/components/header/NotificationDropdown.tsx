import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { useNotifications } from "../../context/NotificationContext";
import { notificacionService } from "../../api/notificacion.service";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Usar el contexto de notificaciones
  const { 
    notificaciones, 
    conteoNoLeidas, 
    loading, 
    error, 
    marcarComoLeida 
  } = useNotifications();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  // Función para manejar el click en una notificación
  const handleNotificationClick = async (notificacion: any) => {
    console.log("🔔 [NotificationDropdown] Click en notificación:", notificacion);
    
    // Si la notificación no está leída, marcarla como leída
    if (!notificacion.leida) {
      try {
        await marcarComoLeida(notificacion.id_notificacion);
        console.log("✅ [NotificationDropdown] Notificación marcada como leída");
      } catch (error) {
        console.error("❌ [NotificationDropdown] Error al marcar como leída:", error);
      }
    }
    
    // Cerrar el dropdown
    closeDropdown();
  };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {/* Badge dinámico basado en conteoNoLeidas */}
        {conteoNoLeidas > 0 && (
          <span className="absolute right-0 top-0.5 z-10 flex items-center justify-center">
            {/* Punto animado */}
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75 animate-ping"></span>
            {/* Badge con número */}
            <span className="relative flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-orange-500 rounded-full min-w-[20px]">
              {conteoNoLeidas > 99 ? '99+' : conteoNoLeidas}
            </span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header del dropdown */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notificaciones
            </h5>
            {conteoNoLeidas > 0 && (
              <span className="flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-full min-w-[20px]">
                {conteoNoLeidas}
              </span>
            )}
          </div>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        
        {/* Lista de notificaciones */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading && (
            <li className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                <span>Cargando notificaciones...</span>
              </div>
            </li>
          )}
          
          {error && (
            <li className="flex items-center justify-center p-8">
              <div className="text-center text-red-500 dark:text-red-400">
                <div className="mb-2">❌ Error al cargar notificaciones</div>
                <div className="text-xs text-gray-500">{error}</div>
              </div>
            </li>
          )}
          
          {!loading && !error && notificaciones.length === 0 && (
            <li className="flex items-center justify-center p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔔</div>
                <div className="font-medium">No hay notificaciones</div>
                <div className="text-xs">Todas las notificaciones aparecerán aquí</div>
              </div>
            </li>
          )}
          
          {!loading && !error && notificaciones.map((notificacion) => {
            // Validar que la notificación tenga datos completos
            if (!notificacion || !notificacion.id_notificacion) {
              console.warn("⚠️ [NotificationDropdown] Notificación con datos incompletos:", notificacion);
              return null;
            }

            return (
              <li key={notificacion.id_notificacion}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notificacion)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                    !notificacion.leida 
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' 
                      : ''
                  }`}
                >
                  {/* Ícono de la notificación */}
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-lg">
                      {notificacionService.getIconoPorTipo(notificacion.tipo || 'default')}
                    </span>
                    {!notificacion.leida && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    )}
                  </span>

                  {/* Contenido de la notificación */}
                  <span className="block flex-1">
                    <span className={`mb-1.5 block text-theme-sm space-x-1 ${
                      !notificacion.leida 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span className={`font-medium ${
                        !notificacion.leida 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-800 dark:text-white/90'
                      }`}>
                        {notificacion.titulo || 'Sin título'}
                      </span>
                      {notificacion.mensaje && (
                        <span className="block mt-1 text-sm">
                          {notificacion.mensaje}
                        </span>
                      )}
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span className="capitalize">{notificacion.tipo || 'general'}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{notificacionService.formatearTiempoTranscurrido(notificacion.fecha_creacion || new Date().toISOString())}</span>
                      {!notificacion.leida && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="text-blue-500 dark:text-blue-400 font-medium">No leída</span>
                        </>
                      )}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            );
          }).filter(Boolean)}
        </ul>
        
        {/* Footer con link para ver todas las notificaciones */}
        {!loading && notificaciones.length > 0 && (
          <Link
            to="/notificaciones"
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            onClick={closeDropdown}
          >
            Ver todas las notificaciones ({notificaciones.length})
          </Link>
        )}
      </Dropdown>
    </div>
  );
}
