import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import AmbienteTableOne from "../../components/tables/AmbienteTables/AmbienteTableOne";

export default function AmbienteDeFormacion() {
    return (
        <>
            <PageMeta
                title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Ambiente de Formación" />
            <div className="space-y-6">

                <AmbienteTableOne />

            </div>
        </>
    );
}