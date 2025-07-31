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

  // Opciones para el nivel del grupo
  const nivelOptions = [
    { value: "AUXILIAR", label: "AUXILIAR" },
    { value: "COMPLEMENTARIA VIRTUAL", label: "COMPLEMENTARIA VIRTUAL" },
    { value: "CURSO ESPECIAL", label: "CURSO ESPECIAL" },
    { value: "OPERARIO", label: "OPERARIO" },
    { value: "TÉCNICO", label: "TÉCNICO" },
    { value: "TECNÓLOGO", label: "TECNÓLOGO" }
  ];

  // Opciones para la etapa
  const etapaOptions = [
    { value: "LECTIVA", label: "LECTIVA" },
    { value: "PRODUCTIVA", label: "PRODUCTIVA" },
  ];

  // Opciones para la modalidad
  const modalidadOptions = [
    { value: "PRESENCIAL", label: "PRESENCIAL" },
    { value: "VIRTUAL", label: "VIRTUAL" },
    { value: "HIBRIDA", label: "HÍBRIDA" },
    { value: "A DISTANCIA TRADICIONAL", label: "A DISTANCIA TRADICIONAL" }
  ];

  // Opciones para la jornada
  const jornadaOptions = [
    { value: "DIURNA", label: "MAÑANA" },
    { value: "MIXTA", label: "MIXTA" },
    { value: "NOCTURNA", label: "MADRUGADA" }
  ];

  // Opciones para el municipio
  const municipioOptions = [
    { value: "PEREIRA", label: "PEREIRA" },
    { value: "DOSQUEBRADAS", label: "DOSQUEBRADAS" },
    { value: "LA VIRGINIA", label: "LA VIRGINIA" },
    { value: "SANTA ROSA DE CABAL", label: "SANTA ROSA DE CABAL" },
    { value: "BELÉN DE UMBRÍA", label: "BELÉN DE UMBRÍA" },
    { value: "GUÁTICA", label: "GUÁTICA" },
    { value: "LA CELIA", label: "LA CELIA" },
    { value: "SANTUARIO", label: "SANTUARIO" },
    { value: "APÍA", label: "APÍA" },
    { value: "BALBOA", label: "BALBOA" },
    { value: "PUEBLO RICO", label: "PUEBLO RICO" },
    { value: "QUINCHÍA", label: "QUINCHÍA" },
    { value: "MARSELLA", label: "MARSELLA" },
    { value: "MISTRATÓ", label: "MISTRATÓ" }
  ];

  const currentYear = new Date().getFullYear();

  // Manejar cambio en estado del grupo
  const handleEstadoChange = (value: string) => {
    const newFilters = { ...filters, estado_grupo: value };
    setFilters(newFilters);
  };

  // Manejar cambio en nivel del grupo
  const handleNivelChange = (value: string) => {
    const newFilters = { ...filters, nombre_nivel: value || undefined };
    setFilters(newFilters);
  };

  // Manejar cambio en etapa
  const handleEtapaChange = (value: string) => {
    const newFilters = { ...filters, etapa: value || undefined };
    setFilters(newFilters);
  };

  // Manejar cambio en modalidad
  const handleModalidadChange = (value: string) => {
    const newFilters = { ...filters, modalidad: value || undefined };
    setFilters(newFilters);
  };

  // Manejar cambio en jornada
  const handleJornadaChange = (value: string) => {
    const newFilters = { ...filters, jornada: value || undefined };
    setFilters(newFilters);
  };

  // Manejar cambio en municipio
  const handleMunicipioChange = (value: string) => {
    const newFilters = { ...filters, nombre_municipio: value || undefined };
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

          {/* Filtro por Nivel del Grupo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nivel del Grupo
            </label>
            <Select
              options={nivelOptions}
              defaultValue={filters.nombre_nivel}
              onChange={handleNivelChange}
              placeholder="Seleccionar nivel"
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

          {/* Filtro por Etapa */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Etapa
            </label>
            <Select
              options={etapaOptions}
              defaultValue={filters.etapa}
              onChange={handleEtapaChange}
              placeholder="Seleccionar etapa"
              className="w-full"
            />
          </div>

          {/* Filtro por Modalidad */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modalidad
            </label>
            <Select
              options={modalidadOptions}
              defaultValue={filters.modalidad}
              onChange={handleModalidadChange}
              placeholder="Seleccionar modalidad"
              className="w-full"
            />
          </div>

          {/* Filtro por Jornada */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Jornada
            </label>
            <Select
              options={jornadaOptions}
              defaultValue={filters.jornada}
              onChange={handleJornadaChange}
              placeholder="Seleccionar jornada"
              className="w-full"
            />
          </div>

          {/* Filtro por Municipio */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Municipio
            </label>
            <Select
              options={municipioOptions}
              defaultValue={filters.nombre_municipio}
              onChange={handleMunicipioChange}
              placeholder="Seleccionar municipio"
              className="w-full"
            />
          </div>
        </div>

        {/* Indicador de filtros activos */}
        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Filtros activos:</span> 
            Estado: {filters.estado_grupo}
            {filters.nombre_nivel && `, Nivel: ${filters.nombre_nivel}`}
            {filters.año && `, Año: ${filters.año}`}
            {filters.etapa && `, Etapa: ${filters.etapa}`}
            {filters.modalidad && `, Modalidad: ${filters.modalidad}`}
            {filters.jornada && `, Jornada: ${filters.jornada}`}
            {filters.nombre_municipio && `, Municipio: ${filters.nombre_municipio}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FiltroGroup;
