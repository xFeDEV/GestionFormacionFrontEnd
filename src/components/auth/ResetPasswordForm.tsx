import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import InputField from "../form/input/InputField";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import Label from "../form/Label";
import { userService } from "../../api/user.service";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificar que tenemos un token válido
  useEffect(() => {
    if (!token) {
      console.error("No se proporcionó un token de restablecimiento.");
      navigate("/signin");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validación inicial
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!token) {
      setError("Token de restablecimiento no válido.");
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio para restablecer la contraseña
      await userService.resetPassword(token, newPassword);

      setMessage(
        "Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión..."
      );

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Error al restablecer la contraseña. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña para completar el restablecimiento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mostrar mensaje de éxito */}
          {message && (
            <Alert variant="success" title="¡Éxito!" message={message} />
          )}

          {/* Mostrar errores */}
          {error && <Alert variant="error" title="Error" message={error} />}

          {/* Campo Nueva Contraseña */}
          <div>
            <Label>
              Nueva Contraseña <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <InputField
                type={showNewPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showNewPassword ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Nueva Contraseña */}
          <div>
            <Label>
              Confirmar Nueva Contraseña{" "}
              <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword || !token}
            className="w-full"
          >
            {loading ? "Restableciendo..." : "Restablecer Contraseña"}
          </Button>
        </form>

        {/* Enlaces adicionales */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Recordaste tu contraseña?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
