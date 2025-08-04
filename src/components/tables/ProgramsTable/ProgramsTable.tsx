import { useState, useEffect, memo } from "react";
import {
  programService,
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
} from "../../../api/program.service";
import Button from "../../ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import CreateProgramModal from "../../modals/CreateProgramModal";
import EditProgramModal from "../../modals/EditProgramModal";
import useAuth from "../../../hooks/useAuth";

const ProgramsTable = () => {
  // --- AUTENTICACIÓN Y AUTORIZACIÓN ---
  const currentUser = useAuth();
  const allowedRoles = [1, 2]; // 1: superadmin, 2: admin

  // --- ESTADO PRINCIPAL ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const [paginaActual, setPaginaActual] = useState(1);
  const programsPorPagina = 10;

  // --- ESTADO PARA MODALES ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>();

  const fetchPrograms = async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);

      const skip = (paginaActual - 1) * programsPorPagina;
      const limit = programsPorPagina;

      let data;
      if (searchQuery && searchQuery.trim() !== "") {
        data = await programService.searchPrograms(
          searchQuery.trim(),
          skip,
          limit
        );
      } else {
        data = await programService.getAllPrograms(skip, limit);
      }

      setPrograms(data.items);
      setTotalItems(data.total_items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los programas."
      );
      setPrograms([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Resetear a la primera página cuando cambie el término de búsqueda
    setPaginaActual(1);
  }, [searchTerm]);

  useEffect(() => {
    // Buscar cuando cambie el término de búsqueda o la página (con debounce)
    const delayedSearch = setTimeout(() => {
      fetchPrograms(searchTerm);
    }, 300);

    // Función de limpieza
    return () => {
      clearTimeout(delayedSearch);
    };
  }, [searchTerm, paginaActual]);

  const totalPaginas = Math.ceil(totalItems / programsPorPagina);

  const handleCambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const obtenerNumerosDePagina = () => {
    const paginas = [];
    const maxPaginasVisibles = 7;
    const paginasAlrededor = 2;

    if (totalPaginas <= maxPaginasVisibles) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);
      if (paginaActual - paginasAlrededor > 2) paginas.push("...");

      let inicio = Math.max(2, paginaActual - paginasAlrededor);
      let fin = Math.min(totalPaginas - 1, paginaActual + paginasAlrededor);

      for (let i = inicio; i <= fin; i++) paginas.push(i);

      if (paginaActual + paginasAlrededor < totalPaginas - 1)
        paginas.push("...");
      paginas.push(totalPaginas);
    }
    return paginas;
  };

  const numerosDePagina = obtenerNumerosDePagina();

  const formatearHoras = (horas: number) => {
    return `${horas} hrs`;
  };

  const calcularHorasTotales = (program: Program) => {
    return program.horas_lectivas + program.horas_productivas;
  };

  // --- MANEJADORES DE EVENTOS ---
  const handleEditClick = (program: Program) => {
    setSelectedProgram(program);
    setIsEditModalOpen(true);
  };

  const handleCreateSave = async (payload: CreateProgramPayload) => {
    try {
      await programService.createProgram(payload);
      setIsCreateModalOpen(false);
      // Recargar los datos
      await fetchPrograms(searchTerm);
    } catch (err) {
      console.error("Error al crear el programa:", err);
      throw err; // Re-lanzar para que el modal pueda manejar el error
    }
  };

  const handleEditSave = async (payload: UpdateProgramPayload) => {
    if (!selectedProgram) return;
    try {
      await programService.updateProgram(selectedProgram.cod_programa, payload);
      setIsEditModalOpen(false);
      // Recargar los datos
      await fetchPrograms(searchTerm);
    } catch (err) {
      console.error("Error al actualizar el programa:", err);
      throw err; // Re-lanzar para que el modal pueda manejar el error
    }
  };

  return (
    <>
      {/* Barra de búsqueda y botón crear */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Buscar programas por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Botón Crear Programa (solo para usuarios autorizados) */}
        {currentUser && allowedRoles.includes(currentUser.id_rol) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#39A900] text-white rounded-md hover:bg-[#2d8000] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            title="Crear Programa"
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
            <span className="xs:inline sm:hidden md:inline">
              Crear Programa
            </span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Cargando programas...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌ {error}</div>
          <button
            onClick={() => fetchPrograms(searchTerm)}
            className="text-[#39A900] hover:text-[#2d8000] underline"
          >
            Intentar nuevamente
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Código
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Versión
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Nombre del Programa
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Horas Lectivas
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Horas Productivas
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Total Horas
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {programs.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {searchTerm
                          ? "No se encontraron programas que coincidan con la búsqueda"
                          : "No hay programas disponibles"}
                      </td>
                    </TableRow>
                  ) : (
                    programs.map((program) => (
                      <TableRow
                        key={`${program.cod_programa}-${program.la_version}`}
                      >
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color="primary">
                            {program.cod_programa}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                          <Badge size="sm" color="light">
                            v{program.la_version}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          <div
                            className="max-w-xs truncate"
                            title={program.nombre}
                          >
                            {program.nombre}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              📚 {formatearHoras(program.horas_lectivas)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              🏭 {formatearHoras(program.horas_productivas)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color="success">
                            {formatearHoras(calcularHorasTotales(program))}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center space-x-2">
                            {currentUser &&
                              allowedRoles.includes(currentUser.id_rol) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(program)}
                                  className="flex items-center gap-1"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* --- PAGINACIÓN RESPONSIVE --- */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 sm:px-6 dark:bg-gray-900 dark:border-white/[0.05] mt-4 rounded-lg">
              {/* Vista Móvil */}
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => handleCambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handleCambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>

              {/* Vista de Escritorio */}
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(paginaActual - 1) * programsPorPagina + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(paginaActual * programsPorPagina, totalItems)}
                    </span>{" "}
                    de <span className="font-medium">{totalItems}</span>{" "}
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
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {numerosDePagina.map((pagina, index) =>
                      typeof pagina === "number" ? (
                        <button
                          key={index}
                          onClick={() => handleCambiarPagina(pagina)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                            paginaActual === pagina
                              ? "z-10 bg-[#39A900] text-white"
                              : "text-gray-900 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                          } border border-gray-300 dark:border-gray-700`}
                        >
                          {pagina}
                        </button>
                      ) : (
                        <span
                          key={index}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                        >
                          ...
                        </span>
                      )
                    )}
                    <button
                      onClick={() => handleCambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- MODALES --- */}
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

export default memo(ProgramsTable);
