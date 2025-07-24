import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTheme } from "../../context/ThemeContext";

export default function ModalityChart() {
  const { theme } = useTheme();

  const lightColors = ["#465fff", "#3B82F6", "#1E40AF"];
  const darkColors = ["#1E40AF", "#3B82F6", "#465fff"];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    colors: theme === "dark" ? darkColors : lightColors,
    labels: ["A DISTANCIA", "PRESENCIAL", "VIRTUAL"],
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "18px",
        fontFamily: "Outfit, sans-serif",
      },
    },
    
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
      y: {
        formatter: (val: number) => `${val}`,
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
    },
  };

  const series = [44, 55, 22];
 
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Modalidad
        </h3>
        
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[400px]">
          <Chart key={theme} options={options} series={series} type="pie" height={407} />
        </div>
      </div>
    </div>
  );
}