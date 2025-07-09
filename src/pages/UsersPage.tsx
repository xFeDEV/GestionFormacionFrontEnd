import { useState, useEffect } from 'react';
import { userService, User, UpdateUserPayload, CreateUserPayload } from '../api/user.service';
import BasicTableOne from '../components/tables/BasicTables/BasicTableOne';
import ComponentCard from '../components/common/ComponentCard';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import EditUserModal from '../components/modals/EditUserModal';
import CreateUserModal from '../components/modals/CreateUserModal';
import Button from '../components/ui/button/Button';
import useAuth from '../hooks/useAuth';
import Alert from '../components/ui/alert/Alert';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentUser = useAuth();
  const allowedRoles = [1, 2]; // 1: Superadmin, 2: Admin

  // Función para obtener usuarios (extraída para reutilización)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del usuario desde localStorage
      const userDataString = localStorage.getItem('user_data');
      if (!userDataString) {
        setError('No se encontraron datos del usuario');
        return;
      }

      const userData = JSON.parse(userDataString);
      const codCentro = userData.cod_centro;

      if (!codCentro) {
        setError('No se encontró el código de centro del usuario');
        return;
      }

      // Llamar al servicio para obtener usuarios por centro
      const usersData = await userService.getUsersByCentro(codCentro);
      
      // Mapear los datos para convertir id_usuario a id (ya que el API devuelve id_usuario)
      const mappedUsers = usersData.map(user => ({
        ...user,
        id: user.id_usuario || user.id // Usar id_usuario si existe, sino usar id
      }));
      
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && allowedRoles.includes(currentUser.id_rol)) {
      fetchUsers();
    }
  }, [currentUser]);

  // Función para abrir el modal de creación
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // Función para manejar el clic en el botón "Editar"
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Función para manejar el cambio de estado del usuario
  const handleStatusChange = async (user: User) => {
    try {
      // Llamar al servicio para modificar el estado
      await userService.modifyUserStatus(user.id);
      
      // Actualizar el usuario en el estado local
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, estado: !u.estado } : u
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  // Función para crear un nuevo usuario
  const handleCreateUser = async (formData: any) => {
    try {
      // Obtener cod_centro del usuario autenticado
      const userDataString = localStorage.getItem('user_data');
      if (!userDataString) {
        throw new Error('No se encontraron datos del usuario autenticado');
      }

      const userData = JSON.parse(userDataString);
      const codCentro = userData.cod_centro;

      if (!codCentro) {
        throw new Error('No se encontró el código de centro del usuario');
      }

      // Construir el payload completo para la API
      const payload: CreateUserPayload = {
        ...formData,
        cod_centro: codCentro,
        estado: true // Por defecto, los nuevos usuarios están activos
      };

      // Llamar al servicio para crear el usuario
      await userService.createUser(payload);

      // Cerrar el modal
      setIsCreateModalOpen(false);
      
      // Refrescar la lista de usuarios para mostrar el nuevo usuario
      await fetchUsers();
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

  // Función para manejar el guardado de cambios del usuario
  const handleSaveChanges = async (updatedData: UpdateUserPayload) => {
    if (!selectedUser) return;

    try {
      const { correo, ...otrosDatos } = updatedData;
      const payloadParaActualizar: UpdateUserPayload = { ...otrosDatos };

      if (correo && correo !== selectedUser.correo) {
        payloadParaActualizar.correo = correo;
      }

      // Llamar al servicio para actualizar el usuario
      await userService.updateUser(selectedUser.id, payloadParaActualizar);
      
      // ¡Línea clave! Volver a cargar los usuarios para refrescar la tabla
      await fetchUsers();
      
      // Cerrar el modal
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

  // Si el hook todavía está cargando el usuario, no muestres nada o un spinner.
  if (!currentUser) {
    return <div className="text-center">Verificando acceso...</div>;
  }

  // Si el rol del usuario no está permitido, muestra el mensaje de acceso denegado.
  if (!currentUser.id_rol || !allowedRoles.includes(currentUser.id_rol)) {
    return (
      <Alert
        variant="error"
        title="Acceso Denegado"
        message="No tienes los permisos necesarios para ver esta sección."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Usuarios del Centro" />

      <ComponentCard title="Lista de Usuarios" desc="Usuarios registrados en el centro">
        {/* Botón Crear Usuario */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Usuario
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando usuarios...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Error al cargar usuarios
            </div>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              No hay usuarios disponibles
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              No se encontraron usuarios para este centro.
            </p>
          </div>
        ) : (
          <BasicTableOne 
            tableData={users} 
            onEditClick={handleEditClick}
            onStatusChange={handleStatusChange}
          />
        )}
      </ComponentCard>

      {/* Modal de Edición */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        userData={selectedUser || undefined}
        onSave={handleSaveChanges}
      />

      {/* Modal de Creación */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
};

export default UsersPage; 