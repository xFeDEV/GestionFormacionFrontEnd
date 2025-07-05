import { Navigate } from 'react-router';
import { authService } from '../../api/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas verificando si el usuario está autenticado
 * Si no hay token válido, redirige al usuario a la página de login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Verificar si el usuario está autenticado
  const isAuthenticated = authService.isAuthenticated();
  
  // Si no está autenticado, redirigir a la página de login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  // Si está autenticado, renderizar los children
  return <>{children}</>;
} 