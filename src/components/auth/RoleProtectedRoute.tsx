import { Navigate } from 'react-router';
import { authService } from '../../api/auth.service';
import useAuth from '../../hooks/useAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedRoleIds?: number[];
}

/**
 * Componente que protege rutas verificando autenticación y roles específicos
 * Si no hay token válido, redirige al login
 * Si el usuario no tiene el rol requerido, redirige a una página de acceso denegado
 */
export default function RoleProtectedRoute({ children, allowedRoles, allowedRoleIds }: RoleProtectedRouteProps) {
  // Verificar si el usuario está autenticado
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = useAuth();
  
  // Si no está autenticado, redirigir a la página de login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  // Si no hay currentUser aún, mostrar loading
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Verificando permisos...
        </span>
      </div>
    );
  }
  
  // Verificar permisos por nombre de rol o ID de rol
  let hasPermission = false;
  
  if (allowedRoles && allowedRoles.length > 0) {
    hasPermission = allowedRoles.includes(currentUser.nombre_rol);
  }
  
  if (allowedRoleIds && allowedRoleIds.length > 0) {
    hasPermission = hasPermission || allowedRoleIds.includes(currentUser.id_rol);
  }
  
  // Si no tiene permisos, redirigir al dashboard
  if (!hasPermission) {
    console.log('🚫 [DEBUG] Acceso denegado:', {
      userRole: currentUser.nombre_rol,
      userRoleId: currentUser.id_rol,
      allowedRoles,
      allowedRoleIds
    });
    return <Navigate to="/" replace />;
  }
  
  // Si tiene permisos, renderizar los children
  return <>{children}</>;
}
