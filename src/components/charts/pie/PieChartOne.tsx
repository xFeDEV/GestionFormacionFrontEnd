import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function PieChartOne() {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff", "#9CB9FF", "#F59E42", "#34D399", "#F87171"],
    labels: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo"
    ],
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
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
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="pieChartOne" className="min-w-[400px]">
        <Chart options={options} series={series} type="pie" height={250} />
      </div>
    </div>
  );
}
