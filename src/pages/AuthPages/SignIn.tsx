import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión | Gestión Formación"
        description="Página de inicio de sesión para el sistema de Gestión de Formación."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
