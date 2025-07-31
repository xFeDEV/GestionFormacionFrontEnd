import { useState, useEffect } from "react";
import {
  GroupIcon,
} from "../../icons";
import { grupoService, DashboardFilters, DashboardKPI } from "../../api/grupo.service";

interface GroupKpiProps {
  filters: DashboardFilters;
}

export default function GroupKpi({ filters }: GroupKpiProps) {
  const [kpiData, setKpiData] = useState<DashboardKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!filters.estado_grupo) {
        setKpiData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await grupoService.getDashboardKPIs(filters);
        setKpiData(data);
      } catch (err) {
        console.error("Error al cargar KPIs:", err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, [filters]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total grupos de Formación
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading ? (
                <span className="animate-pulse">Cargando...</span>
              ) : error ? (
                <span className="text-red-500">Error</span>
              ) : (
                kpiData?.total_grupo?.toLocaleString() || "0"
              )}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

    </div>
  );
}
