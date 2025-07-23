import useAuth from "../../hooks/useAuth";

export default function UserMetaCard() {
  const currentUser = useAuth();

  // Función para generar las iniciales del usuario
  const getInitials = (nombreCompleto: string): string => {
    if (!nombreCompleto) return "U";

    const palabras = nombreCompleto.trim().split(/\s+/);

    if (palabras.length >= 2) {
      // Si hay dos o más palabras, tomar la primera letra de las dos primeras
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    } else {
      // Si solo hay una palabra, tomar las dos primeras letras
      const palabra = palabras[0];
      return palabra.length >= 2
        ? (palabra[0] + palabra[1]).toUpperCase()
        : palabra[0].toUpperCase();
    }
  };

  const iniciales = getInitials(currentUser?.nombre_completo || "Usuario");

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{iniciales}</span>
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {currentUser?.nombre_completo || "Usuario"}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser?.nombre_rol || "Rol no definido"}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Colombia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
