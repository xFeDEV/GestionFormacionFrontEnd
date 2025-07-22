import React from "react";
import ProgramsTable from "../../components/tables/ProgramsTable/ProgramsTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
const ProgramsPage: React.FC = () => {
  return (
    <>
      <PageMeta
                title="Gestion Formacion | SENA"
                description="Gestion de programas"
            />

      <PageBreadcrumb pageTitle="Programas de Formación" />
      <ProgramsTable />
    </>
  );
};

export default ProgramsPage;
