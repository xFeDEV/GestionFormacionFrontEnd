import React, { useState, useEffect, useRef } from "react";
import {
  programService,
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
} from "../api/program.service";
import ProgramsTable from "../components/tables/ProgramsTable/ProgramsTable";
import CreateProgramModal from "../components/modals/CreateProgramModal";
import EditProgramModal from "../components/modals/EditProgramModal";
import PageBreadcrumb from "../components/common/PageBreadCrumb"; // Ajusta la ruta si es necesario

const ProgramsPage: React.FC = () => {
  // --- ESTADO DEL COMPONENTE ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para la búsqueda y paginación
  const [filtroNombre, setFiltroNombre] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const programasPorPagina = 10; // Puedes ajustar este valor

  // Estado para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>();

  // Referencia para controlar el scroll y evitar saltos en la paginación
  const gestionContainerRef = useRef<HTMLDivElement>(null);

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
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

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
      await fetchPrograms(); // Recargar la lista para ver el nuevo programa
    } catch (err) {
      console.error("Error al crear el programa:", err);
      // Opcional: mostrar un error en el modal
    }
  };

  const handleEditSave = async (payload: UpdateProgramPayload) => {
    if (!selectedProgram) return;
    try {
      await programService.updateProgram(selectedProgram.cod_programa, payload);
      setIsEditModalOpen(false);
      await fetchPrograms(); // Recargar la lista para ver los cambios
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
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Lógica de ventana deslizante
      items.push(1); // Siempre mostrar la primera página

      if (currentPage > 4) {
        items.push("..."); // Elipsis después de la primera página
      }

      // Calcular el rango de páginas alrededor de la página actual
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          // Evitar duplicar primera y última página
          items.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        items.push("..."); // Elipsis antes de la última página
      }

      items.push(totalPages); // Siempre mostrar la última página
    }

    return items;
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <>
      <PageBreadcrumb pageTitle="Programas de Formación" />

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

        <ProgramsTable
          programs={programasPaginados}
          loading={loading}
          onEditClick={handleEditClick}
        />

        {/* Paginación */}
        {!loading && !error && totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border-t border-gray-200 sm:px-6 dark:bg-gray-900 dark:border-gray-800">
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
                <span className="font-medium">{programasFiltrados.length}</span>{" "}
                resultados
              </p>
            </div>
            <div>
              <nav
                className="inline-flex -space-x-px rounded-md shadow-sm isolate"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handleCambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-3 py-2 text-gray-500 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Anterior
                </button>

                {/* Botones numéricos dinámicos con ventana deslizante */}
                {generatePaginationItems().map((item, index) => {
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
                })}

                <button
                  onClick={() => handleCambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="relative inline-flex items-center px-3 py-2 text-gray-500 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

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
    </>
  );
};

export default ProgramsPage;
