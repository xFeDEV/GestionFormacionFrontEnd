import GroupKpi from "../../components/groupGraph/GroupKpi";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import ModalityChart from "../../components/groupGraph/Modality";
import { DashboardFilters } from "../../api/grupo.service";
import FiltroGroup from "../../components/groupGraph/filtro-group/FiltroGroup";
import { useState } from "react";
import LevelGroup from "../../components/groupGraph/LevelGroup";
import DayGroup from "../../components/groupGraph/DayGroup";
import MunicipalitiesGroup from "../../components/groupGraph/MunicipalitiesGroup";

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters>({
    estado_grupo: "En ejecucion",
  });

  return (
    <>
    <FiltroGroup
      initialFilters={filters}
      onFiltersChange={setFilters}
      className="mb-6"
    />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <GroupKpi filters={filters} />

          <LevelGroup filters={filters} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <ModalityChart filters={filters} />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <MunicipalitiesGroup filters={filters} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DayGroup filters={filters} />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <ModalityChart filters={filters} />
        </div>
      </div>
    </>
  );
}
