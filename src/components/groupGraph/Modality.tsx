import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function ModalityChart() {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    colors: ["#3db767", "#4f61ff", "#6edaff", "#e86d0f", "#e64132"],
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
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
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [44, 55, 13, 43, 22];
 
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Modalidad
        </h3>
        
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[400px]">
          <Chart options={options} series={series} type="pie" height={407} />
        </div>
      </div>
    </div>
  );
}