import React, { useState } from "react";
import InputField from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { userService } from "../../api/user.service";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Llamada al servicio de recuperación de contraseña
      await userService.forgotPassword(email);
      setMessage(
        "Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada."
      );
      setEmail(""); // Limpiar el campo después del éxito
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al enviar la solicitud. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <a
            href="/signin"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a Iniciar Sesión
          </a>
        </div>

        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Recuperar Contraseña
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        </div>

        {message && (
          <Alert
            variant="success"
            title="Solicitud enviada"
            message={message}
          />
        )}

        {error && <Alert variant="error" title="Error" message={error} />}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <InputField
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="tu-email@ejemplo.com"
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Recordaste tu contraseña?{" "}
            <a
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Iniciar Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
