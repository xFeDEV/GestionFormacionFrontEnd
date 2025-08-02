import ComponentCard from "../../components/common/ComponentCard";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import GrupoTable from "../../components/tables/GrupoTables/GrupoTable";

const GrupoPage = () => {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Gestión de Grupos" />

      <ComponentCard
        title="Listado de Grupos de Formación"
        desc="Busque y administre los grupos de su centro."
      >
        <GrupoTable />
      </ComponentCard>
    </div>
  );
};

export default GrupoPage;
