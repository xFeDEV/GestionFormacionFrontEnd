import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <PageMeta
        title="Recuperar Contraseña | Gestión de Formación"
        description="Recupera tu contraseña para acceder al sistema de gestión de formación. Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."
      />
      <AuthLayout className="flex items-center justify-center h-screen">
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
