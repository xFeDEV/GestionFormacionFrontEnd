import { useState, useEffect } from "react";
import Select from "../../form/Select";
import Input from "../../form/input/InputField";
import { DashboardFilters } from "../../../api/grupo.service";

interface FiltroGroupProps {
  initialFilters?: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  className?: string;
}

const FiltroGroup: React.FC<FiltroGroupProps> = ({
  initialFilters = { estado_grupo: "En ejecucion", año: new Date().getFullYear() },
  onFiltersChange,
  className = "",
}) => {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);

  // Opciones para el estado del grupo
  const estadoOptions = [
    { value: "En ejecucion", label: "En Ejecución" },
    { value: "Terminada", label: "Terminada" },
    { value: "Terminado", label: "Terminado" },
    { value: "Terminada por fecha", label: "Terminada por fecha" },
    { value: "Terminada por unificación", label: "Terminada por unificación" },
 
  ];

  const currentYear = new Date().getFullYear();

  // Manejar cambio en estado del grupo
  const handleEstadoChange = (value: string) => {
    const newFilters = { ...filters, estado_grupo: value };
    setFilters(newFilters);
  };

  // Manejar cambio en año
  const handleAñoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const año = e.target.value ? parseInt(e.target.value) : undefined;
    const newFilters = { ...filters, año };
    setFilters(newFilters);
  };

  // Aplicar filtros automáticamente cuando cambien
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      

      <div className="space-y-4">
        {/* Filtros en una fila */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Filtro por Estado del Grupo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado del Grupo *
            </label>
            <Select
              options={estadoOptions}
              defaultValue={filters.estado_grupo}
              onChange={handleEstadoChange}
              placeholder="Seleccionar estado"
              className="w-full"
            />
          </div>

          {/* Filtro por Año */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Año
            </label>
            <Input
              type="number"
              value={filters.año || ""}
              onChange={handleAñoChange}
              placeholder="Ej: 2025"
              min={(currentYear - 10).toString()}
              max={(currentYear + 5).toString()}
              className="w-full"
              hint="Opcional: deja vacío para ver todos los años"
            />
          </div>
        </div>

        {/* Indicador de filtros activos */}
        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Filtros activos:</span> 
            Estado: {filters.estado_grupo}
            {filters.año && `, Año: ${filters.año}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FiltroGroup;
