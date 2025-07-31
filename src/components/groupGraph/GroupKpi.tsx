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

  const renderContent = () => {
    if (isLoading) {
      return <h4 className="animate-pulse text-title-sm text-gray-500">Cargando...</h4>;
    }
    if (error) {
      return <div className="flex items-center justify-center text-red-500">{error}</div>;
    }
    if (!kpiData?.total_grupo) {
      return <h4 className="text-gray-500 text-center">No hay datos para mostrar.</h4>;
    }
    return <div className="text-title-sm font-bold">
      {kpiData.total_grupo.toLocaleString()}
    </div>;
  };

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
              Total Grupos de Formación
            </span>
            <div className="mt-2  text-gray-800  dark:text-white/90">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

    </div>
  );
}
