import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import AmbienteTableOne from "../../components/tables/AmbienteTables/AmbienteTableOne";

export default function AmbienteDeFormacion() {
    return (
        <>
            <PageMeta
                title="Gestion Formacion | SENA"
                description="Gestion de ambientes de formacion"
            />
            <PageBreadcrumb pageTitle="Ambiente de Formación" />
            <div className="space-y-6">

                <AmbienteTableOne />

            </div>
        </>
    );
}