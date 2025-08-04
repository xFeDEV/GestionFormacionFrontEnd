import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import GrupoSearch from "../../components/GrupoDetails/GrupoSearch";
import GrupoInfoCards from "../../components/GrupoDetails/GrupoInfoCards";
import GestionInstructoresGrupo from "../../components/GrupoDetails/GestionInstructoresGrupo";
import GrupoTable from "../../components/tables/GrupoTables/GrupoTable";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { grupoService, Grupo } from "../../api/grupo.service";
import useAuth from "../../hooks/useAuth";
import Alert from "../../components/ui/alert/Alert";

// Constante para los roles permitidos (Superadmin y Admin)
const ALLOWED_ROLES = [1, 2]; // 1: Superadmin, 2: Admin

const GrupoPage = () => {
  // Usuario autenticado y roles permitidos
  const currentUser = useAuth();

  // Estado para almacenar los detalles del grupo seleccionado
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el modal de tabla de grupos
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Si el hook todavía está cargando el usuario, mostrar verificación
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Si el rol del usuario no está permitido, mostrar acceso denegado
  if (!currentUser.id_rol || !ALLOWED_ROLES.includes(currentUser.id_rol)) {
    return (
      <Alert
        variant="error"
        title="Acceso Denegado"
        message="No tienes los permisos necesarios para ver esta sección."
      />
    );
  }

  // Función que maneja la selección de un grupo
  const handleGrupoSelect = async (grupo: Grupo) => {
    try {
      setLoading(true);
      setError(null);
      
      // Aunque recibimos información básica del search, necesitamos obtener
      // los detalles completos usando el endpoint enriquecido para tener toda la información
      const grupoCompleto = await grupoService.getGrupoByFicha(grupo.cod_ficha);
      
      // Establecer el grupo con información completa y enriquecida
      setGrupoSeleccionado(grupoCompleto);
    } catch (err) {
      console.error("Error al obtener detalles completos del grupo:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Error al cargar los detalles completos del grupo. Por favor, intente nuevamente."
      );
      setGrupoSeleccionado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Gestión de Grupos" />

      <ComponentCard
        title="Consulta de Grupos de Formación"
        desc="Busque un grupo específico para ver sus detalles completos."
      >
        {/* Botón para abrir tabla completa */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => setIsTableModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2 text-brand-600 border-brand-300 hover:bg-brand-50 hover:border-brand-400 dark:text-brand-400 dark:border-brand-600 dark:hover:bg-brand-900/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Ver Todos los Grupos
          </Button>
        </div>

        {/* Componente de búsqueda */}
        <GrupoSearch onGrupoSelect={handleGrupoSelect} />

        {/* Mostrar loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 px-4 mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-3"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cargando detalles del grupo...
            </p>
          </div>
        )}

        {/* Mostrar error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-lg">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Renderizar condicionalmente las tarjetas de información */}
        {grupoSeleccionado && !loading && !error && (
          <div className="mt-6">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center">
                <span className="text-green-500 text-lg mr-3">✅</span>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Grupo encontrado: Ficha #{grupoSeleccionado.cod_ficha}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    {grupoSeleccionado.responsable && `Responsable: ${grupoSeleccionado.responsable}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <GrupoInfoCards grupo={grupoSeleccionado} />
              <GestionInstructoresGrupo cod_ficha={grupoSeleccionado.cod_ficha} />
            </div>
          </div>
        )}

        {/* Mensaje de estado inicial */}
        {!grupoSeleccionado && !loading && !error && (
          <div className="mt-8 text-center py-12 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Seleccione un grupo para comenzar
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Use el buscador arriba para encontrar un grupo específico y ver todos sus detalles organizados en tarjetas informativas.
            </p>
          </div>
        )}
      </ComponentCard>

      {/* Modal con la tabla completa de grupos */}
      <Modal 
        isOpen={isTableModalOpen} 
        onClose={() => setIsTableModalOpen(false)}
        className="max-w-[95vw] w-full max-h-[90vh]"
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📋 Todos los Grupos de Formación
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Listado completo con búsqueda, filtros y paginación
              </p>
            </div>
            <Button
              onClick={() => setIsTableModalOpen(false)}
              variant="outline"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          
          {/* Tabla de grupos */}
          <div className="max-h-[70vh] overflow-auto">
            <GrupoTable />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GrupoPage;
