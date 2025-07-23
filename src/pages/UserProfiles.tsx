import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import useAuth from "../hooks/useAuth";
import { userService, UpdateUserPayload } from "../api/user.service";
import { authService } from "../api/auth.service";

export default function UserProfiles() {
  const currentUser = useAuth();

  // Función para manejar la actualización de datos del usuario
  const handleUpdateUser = async (updatedData: UpdateUserPayload) => {
    if (!currentUser) {
      console.error("No se encontró el usuario actual para actualizar.");
      return;
    }
    try {
      // Desestructura los datos del formulario.
      const { correo, ...otrosDatos } = updatedData;
      // Crea el objeto de payload solo con los datos que no son el correo.
      const payloadParaActualizar: UpdateUserPayload = { ...otrosDatos };
      // Lógica condicional: Solo añade el correo al payload si ha cambiado.
      if (correo && correo !== currentUser.correo) {
        payloadParaActualizar.correo = correo;
      }
      // Llama a la API con el payload limpio.
      await userService.updateUser(
        currentUser.id_usuario,
        payloadParaActualizar
      );
      // Actualizar los datos locales con los nuevos datos
      authService.updateLocalUserData(payloadParaActualizar);
      // Forzar un refresco de la página para cargar los nuevos datos
      window.location.reload();
      // Aquí podrías llamar a una función para refrescar los datos del usuario si es necesario.
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      // Opcional: Muestra una alerta de error al usuario.
      alert("Hubo un error al actualizar el perfil.");
    }
  };

  // Mostrar cargando mientras se obtienen los datos del usuario
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Cargando perfil...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Perfil de Usuario" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard
            currentUser={{
              ...currentUser,
              id: currentUser.id_usuario,
              estado: true,
            }}
            onSave={handleUpdateUser}
          />
          {/* <UserAddressCard /> */}
        </div>
      </div>
    </>
  );
}
