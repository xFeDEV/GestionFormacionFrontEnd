import GroupKpi from "../../components/groupGraph/GroupKpi";
import ModalityChart from "../../components/groupGraph/Modality";
import { DashboardFilters } from "../../api/grupo.service";
import FiltroGroup from "../../components/groupGraph/filtro-group/FiltroGroup";
import { useState } from "react";
import LevelGroup from "../../components/groupGraph/LevelGroup";
import DayGroup from "../../components/groupGraph/DayGroup";
import MunicipalitiesGroup from "../../components/groupGraph/MunicipalitiesGroup";
import useAuth from "../../hooks/useAuth";
import Alert from "../../components/ui/alert/Alert";

// Constante para los roles permitidos (Superadmin y Admin)
const ALLOWED_ROLES = [1, 2]; // 1: Superadmin, 2: Admin

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters>({
    estado_grupo: "En ejecucion",
  });

  // Usuario autenticado y roles permitidos
  const currentUser = useAuth();

  // Si el hook todavía está cargando el usuario, mostrar verificación
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Si el rol del usuario no está permitido, mostrar acceso denegado
  if (!currentUser.id_rol || !ALLOWED_ROLES.includes(currentUser.id_rol)) {
    return (
      <Alert
        variant="error"
        title="Acceso Denegado"
        message="No tienes los permisos necesarios para ver esta sección."
      />
    );
  }

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

      </div>
    </>
  );
}
