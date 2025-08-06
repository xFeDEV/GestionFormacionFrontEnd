import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { grupoService, DashboardFilters, DistribucionModalidad } from "../../api/grupo.service"; // 1. Importar servicio e interfaces
import useMediaQuery from "../../hooks/useMediaQuery";

// 2. Definir las props que el componente recibirá
interface ModalityChartProps {
  filters: DashboardFilters;
}

export default function ModalityChart({ filters }: ModalityChartProps) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 3. Definir el estado para los datos, la carga y los errores
  const [chartData, setChartData] = useState<{ series: number[]; labels: string[] }>({
    series: [],
    labels: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4. Usar useEffect para buscar los datos cuando los filtros cambien
  useEffect(() => {
    const fetchData = async () => {
      // Debug: Verificar valores
      console.log('Filters:', filters);
      
      // Validar que los filtros obligatorios existan
      if (!filters.estado_grupo) { 
        setChartData({ series: [], labels: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data: DistribucionModalidad[] = await grupoService.getDistribucionPorModalidad(filters);

        // Transformar los datos para el formato que necesita el gráfico
        const labels = data.map(item => item.modalidad);
        const series = data.map(item => item.total_aprendices_formacion);

        setChartData({ labels, series });
      } catch (err) {
        console.error("Error al cargar datos de modalidad:", err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]); // El efecto se ejecuta cada vez que el objeto 'filters' cambia

  const lightColors = ["#465fff", "#3B82F6", "#1E40AF", "#60A5FA"];
  const darkColors = ["#1E40AF", "#3B82F6", "#465fff", "#93C5FD"];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    colors: theme === "dark" ? darkColors : lightColors,
    labels: chartData.labels, // 5. Usar labels del estado
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
      labels: {
        colors: theme === "dark" ? "#FFF" : "#000",
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "18px",
        fontFamily: "Outfit, sans-serif",
      },
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light", // Tooltip dinámico
      fillSeriesColor: false,
      y: {
        formatter: (val: number) => `${val} aprendices`,
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
    },
  };

  // 6. Renderizado condicional para mostrar estados de carga, error o datos
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex h-[330px] items-center justify-center text-gray-500">Cargando...</div>;
    }
    if (error) {
      return <div className="flex h-[330px] items-center justify-center text-red-500">{error}</div>;
    }
    if (chartData.series.length === 0) {
      return <div className="flex h-[330px] items-center justify-center text-gray-500">No hay datos para mostrar.</div>;
    }
    return (
      <div className="min-w-[400px]">
        <Chart
          key={theme}
          options={options}
          series={chartData.series} // Usar series del estado
          type="donut"
          height={isMobile ? 360 : 407} 
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between px-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Distribución por Modalidad
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
}