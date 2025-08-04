import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import { useState, useEffect } from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { ambienteService, Ambiente, CreateAmbientePayload, UpdateAmbientePayload } from "../../../api/ambiente.service";
import CreateAmbienteModal from "../../modals/CreateAmbienteModal";
import EditAmbienteModal from "../../modals/EditAmbienteModal";
import useAuth from "../../../hooks/useAuth";

// Constante para los roles permitidos (Superadmin y Admin)
const ALLOWED_ROLES = [1, 2]; // 1: Superadmin, 2: Admin

export default function BasicTableAmbiente() {
  // Usuario autenticado y roles permitidos
  const currentUser = useAuth();
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const ambientesPorPagina = 10;
  
  // Estados para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAmbiente, setSelectedAmbiente] = useState<Ambiente | undefined>();
  
  // Obtener el código del centro desde localStorage
  const userData = localStorage.getItem('user_data');
  const codCentro = userData ? JSON.parse(userData).cod_centro : null;

  // Cargar ambientes al montar el componente
  useEffect(() => {
    const cargarAmbientes = async () => {
      if (!codCentro) {
        setError('No se encontró el código del centro en la sesión');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ambienteService.getAmbientesActivosByCentro(codCentro);
        setAmbientes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar ambientes');
        console.error('Error cargando ambientes:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarAmbientes();
  }, [codCentro]);

  const ambientesFiltrados = ambientes.filter((ambiente) =>
    ambiente.nombre_ambiente.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  // Calcular el total de páginas
  const totalPaginas = Math.ceil(ambientesFiltrados.length / ambientesPorPagina);

  // Obtener los ambientes de la página actual
  const ambientesPaginados = ambientesFiltrados.slice(
    (paginaActual - 1) * ambientesPorPagina,
    paginaActual * ambientesPorPagina
  );



  const handleEditar = (ambiente: Ambiente) => {
    setSelectedAmbiente(ambiente);
    setIsEditModalOpen(true);
  };

  const handleCrearAmbiente = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (ambienteData: CreateAmbientePayload) => {
    try {
      await ambienteService.createAmbiente(ambienteData);
      // Recargar la lista de ambientes
      const data = await ambienteService.getAmbientesActivosByCentro(codCentro!);
      setAmbientes(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creando ambiente:', err);
      throw err; // Re-lanzar para que el modal maneje el error
    }
  };

  const handleEditSave = async (ambienteData: UpdateAmbientePayload) => {
    try {
      if (selectedAmbiente?.id_ambiente) {
        await ambienteService.updateAmbiente(selectedAmbiente.id_ambiente, ambienteData);
        // Recargar la lista de ambientes
        const data = await ambienteService.getAmbientesActivosByCentro(codCentro!);
        setAmbientes(data);
        setIsEditModalOpen(false);
        setSelectedAmbiente(undefined);
      }
    } catch (err) {
      console.error('Error actualizando ambiente:', err);
      throw err; // Re-lanzar para que el modal maneje el error
    }
  };



  const handleCambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y botón crear */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {/* Botón Crear Ambiente (solo para superadmin y admin) */}
        {currentUser && currentUser.id_rol && ALLOWED_ROLES.includes(currentUser.id_rol) && (
          <button
            onClick={handleCrearAmbiente}
            className="w-full sm:w-auto px-4 py-2 bg-[#39A900] text-white rounded-md hover:bg-[#2d8000] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            title="Crear Ambiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="xs:inline sm:hidden md:inline">Crear Ambiente</span>
            <span className="hidden sm:inline md:hidden">Crear</span>
          </button>
        )}
      </div>

      {/* Estados de carga y error */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando ambientes...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-[#39A900] text-white rounded-md hover:bg-[#2d8000] transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Código Centro
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nombre Ambiente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Máx. Aprendices
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Municipio
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ubicación
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {ambientesPaginados.map((ambiente) => (
                <TableRow key={ambiente.id_ambiente}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {ambiente.cod_centro}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {ambiente.nombre_ambiente}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ambiente.num_max_aprendices}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ambiente.municipio}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ambiente.ubicacion}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        ambiente.estado
                          ? "success"
                          : "error"
                      }
                    >
                      {ambiente.estado ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {/* Botón Editar (solo para superadmin y admin) */}
                    {currentUser && currentUser.id_rol && ALLOWED_ROLES.includes(currentUser.id_rol) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditar(ambiente)}
                        className="px-3 py-1 text-xs"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      )}

      {/* Paginación */}
      {!loading && !error && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handleCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => handleCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Mostrando <span className="font-medium">{(paginaActual - 1) * ambientesPorPagina + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(paginaActual * ambientesPorPagina, ambientesFiltrados.length)}
              </span>{" "}
              de <span className="font-medium">{ambientesFiltrados.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
              <button
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              {[...Array(totalPaginas)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handleCambiarPagina(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${paginaActual === index + 1
                      ? "z-10 bg-[#39A900] text-white"
                      : "text-gray-900 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    } border border-gray-300 dark:border-gray-700`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
      )}

      {/* Modales */}
      <CreateAmbienteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        codCentro={codCentro!}
      />

      <EditAmbienteModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAmbiente(undefined);
        }}
        ambienteData={selectedAmbiente}
        onSave={handleEditSave}
      />
    </div>
  );
}