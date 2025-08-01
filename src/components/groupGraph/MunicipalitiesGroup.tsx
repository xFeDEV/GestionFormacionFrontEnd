import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { grupoService, DashboardFilters, DistribucionMunicipio } from "../../api/grupo.service"; // 1. Importar servicio e interfaces

// 2. Definir las props que el componente recibirá
interface MunicipalitiesGroupProps {
  filters: DashboardFilters;
}

export default function MunicipalitiesGroup({ filters }: MunicipalitiesGroupProps) {
  const { theme } = useTheme();

  // 3. Definir el estado para los datos, la carga y los errores
  const [chartData, setChartData] = useState<{ series: { name: string; data: number[] }[]; categories: string[] }>({
    series: [],
    categories: [],
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
        setChartData({ series: [], categories: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data: DistribucionMunicipio[] = await grupoService.getDistribucionPorMunicipio(filters);

        // Transformar los datos para el formato que necesita el gráfico de barras
        const categories = data.map(item => item.municipio);
        const seriesData = data.map(item => item.cantidad);

        setChartData({ 
          categories, 
          series: [{
            name: "Grupos",
            data: seriesData
          }]
        });
      } catch (err) {
        console.error("Error al cargar datos de municipio:", err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]); // El efecto se ejecuta cada vez que el objeto 'filters' cambia

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories, // 5. Usar categories del estado
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: theme === "dark" ? "#FFF" : "#000",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      labels: {
        colors: theme === "dark" ? "#FFF" : "#000",
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: theme === "dark" ? "#FFF" : "#000",
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light", // Tooltip dinámico
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} grupos`,
      },
    },
  };

  // 6. Renderizado condicional para mostrar estados de carga, error o datos
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex h-[250px] items-center justify-center text-gray-500">Cargando...</div>;
    }
    if (error) {
      return <div className="flex h-[250px] items-center justify-center text-red-500">{error}</div>;
    }
    if (chartData.series.length === 0 || chartData.categories.length === 0) {
      return <div className="flex h-[250px] items-center justify-center text-gray-500">No hay datos para mostrar.</div>;
    }
    return (
      <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
        <Chart 
          key={theme}
          options={options} 
          series={chartData.series} // Usar series del estado
          type="bar" 
          height={396} 
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Distribución por Municipio
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
}
