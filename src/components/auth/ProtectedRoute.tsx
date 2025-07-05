import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
} 