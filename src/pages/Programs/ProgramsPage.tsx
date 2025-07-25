import React from "react";
import ProgramsTable from "../../components/tables/ProgramsTable/ProgramsTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
const ProgramsPage: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Programas de Formación" />
      <ProgramsTable />
    </>
  );
};

export default ProgramsPage;
