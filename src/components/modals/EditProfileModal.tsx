import React, { useState, useEffect } from "react";
import { User, UpdateUserPayload } from "../../api/user.service";
import { Modal } from "../ui/modal";
import InputField from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: User;
  onSave: (updatedData: UpdateUserPayload) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    nombre_completo: "",
    correo: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Llenar el formulario cuando userData cambie
  useEffect(() => {
    if (userData) {
      setFormData({
        nombre_completo: userData.nombre_completo || "",
        correo: userData.correo || "",
        telefono: userData.telefono || "",
      });
    }
  }, [userData]);

  // Manejar cambios en los inputs de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_completo?.trim()) {
      newErrors.nombre_completo = "El nombre completo es requerido";
    }

    if (!formData.correo?.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido";
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setFormData({
      nombre_completo: "",
      correo: "",
      telefono: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg mx-4">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Editar Perfil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre Completo */}
          <div>
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <InputField
              type="text"
              id="nombre_completo"
              name="nombre_completo"
              placeholder="Ingrese el nombre completo"
              value={formData.nombre_completo || ""}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.nombre_completo}
              hint={errors.nombre_completo}
            />
          </div>

          {/* Correo */}
          <div>
            <Label htmlFor="correo">Correo Electrónico</Label>
            <InputField
              type="email"
              id="correo"
              name="correo"
              placeholder="Ingrese el correo electrónico"
              value={formData.correo || ""}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.correo}
              hint={errors.correo}
            />
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <InputField
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="Ingrese el teléfono"
              value={formData.telefono || ""}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.telefono}
              hint={errors.telefono}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={handleClose} variant="outline" disabled={loading}>
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
