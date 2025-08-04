import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import GruposInstructorTable from "../../components/tables/GruposInstructorTables/GruposInstructorTable";
import useAuth from "../../hooks/useAuth";

const GruposInstructorPage: React.FC = () => {
  // Usuario autenticado
  const currentUser = useAuth();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Mis Grupos Asignados" />

      <ComponentCard
        title="Grupos de Formación Asignados"
        desc={`Grupos asignados al instructor: ${currentUser?.nombre_completo || 'Cargando...'}`}
      >
        <GruposInstructorTable />
      </ComponentCard>
    </div>
  );
};

export default GruposInstructorPage;
