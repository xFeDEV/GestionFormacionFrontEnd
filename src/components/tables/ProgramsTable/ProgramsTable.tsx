import React from "react";
import { Program } from "../../../api/program.service"; // Asegúrate de importar la interfaz
import Button from "../../ui/button/Button"; // Importamos nuestro componente de botón

// 1. Definimos las nuevas props que el componente espera recibir
interface ProgramsTableProps {
  programs: Program[];
  loading: boolean;
  onEditClick: (program: Program) => void; // La nueva función para manejar el clic
}

const ProgramsTable: React.FC<ProgramsTableProps> = ({
  programs,
  loading,
  onEditClick,
}) => {
  return (
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
              {/* 2. Añadimos la nueva columna de Acciones */}
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
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No se encontraron programas.
                </td>
              </tr>
            ) : (
              programs.map((program) => (
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
                  {/* 3. Añadimos la celda con el botón y conectamos el evento */}
                  <td className="px-5 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(program)} // 4. Al hacer clic, se llama a la función de la prop
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
  );
};

export default ProgramsTable;
