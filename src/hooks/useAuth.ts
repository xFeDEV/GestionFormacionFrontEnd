import { useState, useEffect } from "react";

export interface AuthUser {
  id_usuario: number;
  id_rol: number;
  nombre_completo: string;
  email: string;
  correo: string;
  telefono: string;
  tipo_contrato: string;
  identificacion: string;
  nombre_rol: string;
  token: string;
}

const useAuth = (): AuthUser | null => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("user_data");
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString);
        setAuthUser(user);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setAuthUser(null);
      }
    }
  }, []);

  return authUser;
};

export default useAuth;
