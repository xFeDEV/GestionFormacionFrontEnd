import { useState, useEffect } from "react";
import Select from "../../form/Select";
import Input from "../../form/input/InputField";
import Button from "../../ui/button/Button";
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
    { value: "CURSO ESPECIAL", label: "CURSO ESPECIAL" },
    { value: "EVENTO", label: "EVENTO" },
    { value: "OPERARIO", label: "OPERARIO" },
    { value: "TÉCNICO", label: "TÉCNICO" },
    { value: "TECNÓLOGO", label: "TECNÓLOGO" }
  ];

  // Opciones para la etapa
  const etapaOptions = [
    { value: "LECTIVA", label: "LECTIVA" },
    { value: "PRACTICA", label: "PRÁCTICA" },
  ];

  // Opciones para la modalidad
  const modalidadOptions = [
    { value: "PRESENCIAL", label: "PRESENCIAL" },
    { value: "VIRTUAL", label: "VIRTUAL" },
    { value: "A DISTANCIA", label: "A DISTANCIA" }
  ];

  // Opciones para la jornada
  const jornadaOptions = [
    { value: "DIURNA", label: "DIURNA" },
    { value: "MIXTA", label: "MIXTA" },
    { value: "NOCTURNA", label: "NOCTURNA" }
  ];

  // Opciones para el municipio
  const municipioOptions = [
    { value: "PEREIRA", label: "PEREIRA" },
    { value: "DOSQUEBRADAS", label: "DOSQUEBRADAS" },
    { value: "LA VIRGINIA", label: "LA VIRGINIA" },
    { value: "SANTA ROSA DE CABAL", label: "SANTA ROSA DE CABAL" },
    { value: "BELEN DE UMBRÍA", label: "BELÉN DE UMBRÍA" },
    { value: "GUATICA", label: "GUÁTICA" },
    { value: "LA CELIA", label: "LA CELIA" },
    { value: "SANTUARIO", label: "SANTUARIO" },
    { value: "APIA", label: "APÍA" },
    { value: "BALBOA", label: "BALBOA" },
    { value: "PUEBLO RICO", label: "PUEBLO RICO" },
    { value: "QUINCHIA", label: "QUINCHÍA" },
    { value: "MARSELLA", label: "MARSELLA" },
    { value: "MISTRATO", label: "MISTRATÓ" }
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

  // Limpiar filtros y resetear a valores iniciales
  const handleLimpiarFiltros = () => {
    const resetFilters: DashboardFilters = { 
      estado_grupo: "En ejecucion", 
    };
    setFilters(resetFilters);
  };

  // Aplicar filtros automáticamente cuando cambien
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      {/* Encabezado con título y botón de limpiar */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtros de Búsqueda
        </h3>
        <Button
          onClick={handleLimpiarFiltros}
          variant="outline"
          size="sm"
          startIcon={
            <svg 
              className="h-4 w-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          }
        >
          Limpiar Filtros
        </Button>
      </div>

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
              value={filters.estado_grupo}
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
              value={filters.nombre_nivel || ""}
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
              value={filters.etapa || ""}
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
              value={filters.modalidad || ""}
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
              value={filters.jornada || ""}
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
              value={filters.nombre_municipio || ""}
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
