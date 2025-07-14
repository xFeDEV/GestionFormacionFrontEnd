import { useState, useEffect, useRef } from "react";
import {
  userService,
  User,
  UpdateUserPayload,
  CreateUserPayload,
} from "../api/user.service";
import BasicTableOne from "../components/tables/BasicTables/BasicTableOne";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import EditUserModal from "../components/modals/EditUserModal";
import CreateUserModal from "../components/modals/CreateUserModal";
import useAuth from "../hooks/useAuth";
import Alert from "../components/ui/alert/Alert";

// Constante fuera del componente para evitar re-renders
const ALLOWED_ROLES = [1, 2]; // 1: Superadmin, 2: Admin

// Interfaz para los datos del formulario de creación (igual que en CreateUserModal)
interface CreateUserFormData {
  nombre_completo: string;
  identificacion: string;
  id_rol: number;
  correo: string;
  tipo_contrato: string;
  telefono: string;
  pass_hash: string;
}

const UsersPage = () => {
  // --- ESTADO DEL COMPONENTE ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para la búsqueda y filtrado
  const [filtroNombre, setFiltroNombre] = useState("");

  // Estado para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Referencia para controlar el scroll y evitar saltos
  const gestionContainerRef = useRef<HTMLDivElement>(null);

  // Usuario autenticado y roles permitidos
  const currentUser = useAuth();

  // --- LÓGICA DE DATOS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del usuario desde localStorage
      const userDataString = localStorage.getItem("user_data");
      if (!userDataString) {
        setError("No se encontraron datos del usuario");
        return;
      }

      const userData = JSON.parse(userDataString);
      const codCentro = userData.cod_centro;

      if (!codCentro) {
        setError("No se encontró el código de centro del usuario");
        return;
      }

      // Llamar al servicio para obtener usuarios por centro
      const usersData = await userService.getUsersByCentro(codCentro);

      // Mapear los datos para convertir id_usuario a id
      const mappedUsers = usersData.map((user) => ({
        ...user,
        id: user.id_usuario || user.id,
      }));

      setUsers(mappedUsers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los usuarios"
      );
      console.error("Error en fetchUsers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && ALLOWED_ROLES.includes(currentUser.id_rol)) {
      fetchUsers();
    }
  }, [currentUser]);

  // --- DATOS DERIVADOS (Filtrado) ---
  const usuariosFiltrados = users.filter(
    (user) =>
      user.nombre_completo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
      user.correo.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  // --- MANEJADORES DE EVENTOS (HANDLERS) ---
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (user: User) => {
    try {
      await userService.modifyUserStatus(user.id);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, estado: !u.estado } : u
        )
      );
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
    }
  };

  const handleCreateUser = async (formData: CreateUserFormData) => {
    try {
      // Obtener cod_centro del usuario autenticado
      const userDataString = localStorage.getItem("user_data");
      if (!userDataString) {
        throw new Error("No se encontraron datos del usuario autenticado");
      }

      const userData = JSON.parse(userDataString);
      const codCentro = userData.cod_centro;

      if (!codCentro) {
        throw new Error("No se encontró el código de centro del usuario");
      }

      // Construir el payload completo para la API
      const payload: CreateUserPayload = {
        ...formData,
        cod_centro: codCentro,
        estado: true,
      };

      await userService.createUser(payload);
      setIsCreateModalOpen(false);
      await fetchUsers(); // Recargar la lista para ver el nuevo usuario
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      throw error;
    }
  };

  const handleSaveChanges = async (updatedData: UpdateUserPayload) => {
    if (!selectedUser) return;

    try {
      const { correo, ...otrosDatos } = updatedData;
      const payloadParaActualizar: UpdateUserPayload = { ...otrosDatos };

      if (correo && correo !== selectedUser.correo) {
        payloadParaActualizar.correo = correo;
      }

      await userService.updateUser(selectedUser.id, payloadParaActualizar);
      await fetchUsers(); // Recargar la lista para ver los cambios
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      throw error;
    }
  };

  // Si el hook todavía está cargando el usuario, mostrar verificación
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Si el rol del usuario no está permitido, mostrar acceso denegado
  if (!currentUser.id_rol || !ALLOWED_ROLES.includes(currentUser.id_rol)) {
    return (
      <Alert
        variant="error"
        title="Acceso Denegado"
        message="No tienes los permisos necesarios para ver esta sección."
      />
    );
  }

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <>
      <PageBreadCrumb pageTitle="Gestión de Usuarios" />

      <div
        ref={gestionContainerRef}
        className="rounded-2xl border border-gray-200 bg-white p-5 mt-6 dark:border-gray-800 dark:bg-white/[0.03]"
      >
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Usuarios del Centro
        </h3>

        {/* Barra de Búsqueda y Botón Crear */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-5">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#39A900] text-white rounded-md hover:bg-[#2d8000] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Crear Usuario
          </button>
        </div>

        {/* Estados de Carga y Error */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Tabla de Usuarios */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Cargando usuarios...
            </span>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              {filtroNombre
                ? "No se encontraron usuarios con ese filtro"
                : "No hay usuarios disponibles"}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {filtroNombre
                ? "Intenta con un término de búsqueda diferente."
                : "No se encontraron usuarios para este centro."}
            </p>
          </div>
        ) : (
          <BasicTableOne
            tableData={usuariosFiltrados}
            onEditClick={handleEditClick}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* Renderizado de Modales */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        userData={selectedUser || undefined}
        onSave={handleSaveChanges}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
      />
    </>
  );
};

export default UsersPage;
