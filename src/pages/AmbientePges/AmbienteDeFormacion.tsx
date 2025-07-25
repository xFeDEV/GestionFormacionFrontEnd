import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import AmbienteTableOne from "../../components/tables/AmbienteTables/AmbienteTableOne";

export default function AmbienteDeFormacion() {
  return (
    <>
      <PageBreadcrumb pageTitle="Ambiente de Formación" />
      <div className="space-y-6">
        <AmbienteTableOne />
      </div>
    </>
  );
}
