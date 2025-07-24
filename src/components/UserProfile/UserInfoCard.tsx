import { useModal } from "../../hooks/useModal";
import EditProfileModal from "../modals/EditProfileModal";
import { User, UpdateUserPayload } from "../../api/user.service";

interface Props {
  currentUser: User;
  onSave: (updatedData: UpdateUserPayload) => void;
  onChangePasswordClick?: () => void;
}

export default function UserInfoCard({
  currentUser,
  onSave,
  onChangePasswordClick,
}: Props) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleSaveChanges = (updatedData: UpdateUserPayload) => {
    // Llamar a la función de guardado pasando los datos actualizados
    onSave(updatedData);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Información Personal
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nombre Completo
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser.nombre_completo}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Correo Electrónico
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser.correo}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Teléfono
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser.telefono}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tipo de Contrato
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser.tipo_contrato}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Identificación
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser.identificacion}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Rol
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser.nombre_rol}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Editar Perfil
          </button>

          {onChangePasswordClick && (
            <button
              onClick={onChangePasswordClick}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.5 2.25C3.25736 2.25 2.25 3.25736 2.25 4.5V13.5C2.25 14.7426 3.25736 15.75 4.5 15.75H13.5C14.7426 15.75 15.75 14.7426 15.75 13.5V4.5C15.75 3.25736 14.7426 2.25 13.5 2.25H4.5ZM5.25 6.75C5.25 6.33579 5.58579 6 6 6H9C9.41421 6 9.75 6.33579 9.75 6.75C9.75 7.16421 9.41421 7.5 9 7.5H6C5.58579 7.5 5.25 7.16421 5.25 6.75ZM6 9C5.58579 9 5.25 9.33579 5.25 9.75C5.25 10.1642 5.58579 10.5 6 10.5H12C12.4142 10.5 12.75 10.1642 12.75 9.75C12.75 9.33579 12.4142 9 12 9H6Z"
                  fill=""
                />
              </svg>
              Cambiar Contraseña
            </button>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isOpen}
        onClose={closeModal}
        userData={currentUser || undefined}
        onSave={handleSaveChanges}
      />
    </div>
  );
}
