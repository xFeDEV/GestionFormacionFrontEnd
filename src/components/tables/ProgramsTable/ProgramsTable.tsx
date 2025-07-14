import React, { useState, useEffect, useRef } from "react";
import {
  programService,
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
} from "../../../api/program.service";
import Button from "../../ui/button/Button";
import CreateProgramModal from "../../modals/CreateProgramModal";
import EditProgramModal from "../../modals/EditProgramModal";
import useMediaQuery from "../../../hooks/useMediaQuery";

const ProgramsTable: React.FC = () => {
  // --- ESTADO DEL COMPONENTE ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para la búsqueda y paginación
  const [filtroNombre, setFiltroNombre] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const programasPorPagina = 10;

  // Estado para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>();

  // Referencia para controlar el scroll y evitar saltos en la paginación
  const gestionContainerRef = useRef<HTMLDivElement>(null);

  // Hook para detectar si estamos en una pantalla móvil
  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- LÓGICA DE DATOS ---
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await programService.getAllPrograms();
      setPrograms(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los programas"
      );
      console.error("Error en fetchPrograms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // useEffect para controlar el scroll y evitar saltos en la paginación
  useEffect(() => {
    if (gestionContainerRef.current && paginaActual > 1) {
      gestionContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [paginaActual]);

  // --- DATOS DERIVADOS (Filtrado y Paginación) ---
  const programasFiltrados = programs.filter((program) =>
    program.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const totalPaginas = Math.ceil(
    programasFiltrados.length / programasPorPagina
  );

  const programasPaginados = programasFiltrados.slice(
    (paginaActual - 1) * programasPorPagina,
    paginaActual * programasPorPagina
  );

  // --- MANEJADORES DE EVENTOS (HANDLERS) ---
  const handleEditClick = (program: Program) => {
    setSelectedProgram(program);
    setIsEditModalOpen(true);
  };

  const handleCreateSave = async (payload: CreateProgramPayload) => {
    try {
      await programService.createProgram(payload);
      setIsCreateModalOpen(false);
      await fetchPrograms();
    } catch (err) {
      console.error("Error al crear el programa:", err);
    }
  };

  const handleEditSave = async (payload: UpdateProgramPayload) => {
    if (!selectedProgram) return;
    try {
      await programService.updateProgram(selectedProgram.cod_programa, payload);
      setIsEditModalOpen(false);
      await fetchPrograms();
    } catch (err) {
      console.error("Error al actualizar el programa:", err);
    }
  };

  const handleCambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // --- FUNCIÓN AUXILIAR PARA VENTANA DESLIZANTE DE PAGINACIÓN ---
  const generatePaginationItems = () => {
    const items: (number | string)[] = [];
    const totalPages = totalPaginas;
    const currentPage = paginaActual;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (currentPage > 4) {
        items.push("...");
      }

      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        items.push("...");
      }

      items.push(totalPages);
    }

    return items;
  };
  return (
    <div
      ref={gestionContainerRef}
      className="rounded-2xl border border-gray-200 bg-white p-5 mt-6 dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Gestión de Programas
      </h3>

      {/* Barra de Búsqueda y Botón Crear */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-5">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre de programa..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-[#39A900] text-white rounded-md hover:bg-[#2d8000] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
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
          Crear Programa
        </button>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {/* Tabla de Programas */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">
                  Nombre
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">
                  Código
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">
                  Versión
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">
                  Horas Lectivas
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">
                  Horas Productivas
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Cargando programas...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : programasPaginados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No se encontraron programas.
                  </td>
                </tr>
              ) : (
                programasPaginados.map((program) => (
                  <tr key={program.cod_programa}>
                    <td className="px-5 py-4 text-gray-800 dark:text-white/90">
                      {program.nombre}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {program.cod_programa}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {program.la_version}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {program.horas_lectivas}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {program.horas_productivas}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(program)}
                        className="px-3 py-1 text-xs"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación Responsiva */}
      {!loading && !error && totalPaginas > 1 && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border-t border-gray-200 sm:px-6 dark:bg-gray-900 dark:border-gray-800">
          {/* Información de resultados - Solo en Desktop */}
          {!isMobile && (
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Mostrando{" "}
                <span className="font-medium">
                  {(paginaActual - 1) * programasPorPagina + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(
                    paginaActual * programasPorPagina,
                    programasFiltrados.length
                  )}
                </span>{" "}
                de{" "}
                <span className="font-medium">
                  {programasFiltrados.length}
                </span>{" "}
                resultados
              </p>
            </div>
          )}

          {/* Controles de Paginación */}
          <div className={isMobile ? "w-full" : ""}>
            <nav
              className={`inline-flex -space-x-px rounded-md shadow-sm isolate ${
                isMobile ? "w-full justify-center" : ""
              }`}
              aria-label="Pagination"
            >
              {/* Botón Anterior */}
              <button
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={`relative inline-flex items-center px-3 py-2 text-gray-500 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 ${
                  isMobile ? "flex-1 justify-center" : ""
                }`}
              >
                {isMobile ? "◀" : "Anterior"}
              </button>

              {/* Paginación Desktop vs Mobile */}
              {isMobile ? (
                /* Versión Mobile: Indicador simple de página */
                <div className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 flex-1 justify-center">
                  <span className="font-medium text-[#39A900]">
                    {paginaActual}
                  </span>
                  <span className="mx-1">de</span>
                  <span className="font-medium">{totalPaginas}</span>
                </div>
              ) : (
                /* Versión Desktop: Paginación numérica completa */
                generatePaginationItems().map((item, index) => {
                  if (item === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const numeroPage = item as number;
                  const isActive = numeroPage === paginaActual;
                  return (
                    <button
                      key={numeroPage}
                      onClick={() => handleCambiarPagina(numeroPage)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border transition-colors ${
                        isActive
                          ? "bg-[#39A900] text-white border-[#39A900] z-10 hover:bg-[#2d8000]"
                          : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      {numeroPage}
                    </button>
                  );
                })
              )}

              {/* Botón Siguiente */}
              <button
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className={`relative inline-flex items-center px-3 py-2 text-gray-500 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 ${
                  isMobile ? "flex-1 justify-center" : ""
                }`}
              >
                {isMobile ? "▶" : "Siguiente"}
              </button>
            </nav>
          </div>

          {/* Información de resultados compacta - Solo en Mobile */}
          {isMobile && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {programasFiltrados.length} resultado
                {programasFiltrados.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Renderizado de Modales */}
      <CreateProgramModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />

      <EditProgramModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        programData={selectedProgram}
      />
    </div>
  );
};

export default ProgramsTable;
