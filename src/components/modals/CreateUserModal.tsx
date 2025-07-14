import React, { useState } from "react";
import { Modal } from "../ui/modal";
import InputField from "../form/input/InputField";
import Select from "../form/Select";
import Label from "../form/Label";
import Button from "../ui/button/Button";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserFormData) => void;
}

interface CreateUserFormData {
  nombre_completo: string;
  identificacion: string;
  id_rol: number;
  correo: string;
  tipo_contrato: string;
  telefono: string;
  pass_hash: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    nombre_completo: "",
    identificacion: "",
    id_rol: 1,
    correo: "",
    tipo_contrato: "",
    telefono: "",
    pass_hash: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Opciones para los selects
  const roleOptions = [
    { value: "1", label: "Superadmin" },
    { value: "2", label: "Admin" },
    { value: "3", label: "Instructor" },
  ];

  const contractOptions = [
    { value: "Indefinido", label: "Indefinido" },
    { value: "Temporal", label: "Temporal" },
    { value: "Prácticas", label: "Prácticas" },
    { value: "Freelance", label: "Freelance" },
  ];

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

  // Manejar cambios en el select de rol
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      id_rol: Number(value),
    }));

    if (errors.id_rol) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.id_rol;
        return newErrors;
      });
    }
  };

  // Manejar cambios en el select de tipo de contrato
  const handleContractChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo_contrato: value,
    }));

    if (errors.tipo_contrato) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tipo_contrato;
        return newErrors;
      });
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = "El nombre completo es requerido";
    }

    if (!formData.identificacion.trim()) {
      newErrors.identificacion = "La identificación es requerida";
    }

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido";
    }

    if (!formData.tipo_contrato.trim()) {
      newErrors.tipo_contrato = "El tipo de contrato es requerido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    if (!formData.pass_hash.trim()) {
      newErrors.pass_hash = "La contraseña es requerida";
    } else if (formData.pass_hash.length < 6) {
      newErrors.pass_hash = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.id_rol) {
      newErrors.id_rol = "Debe seleccionar un rol";
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
      handleClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setFormData({
      nombre_completo: "",
      identificacion: "",
      id_rol: 1,
      correo: "",
      tipo_contrato: "",
      telefono: "",
      pass_hash: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg mx-4">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Crear Nuevo Usuario
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
              value={formData.nombre_completo}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.nombre_completo}
              hint={errors.nombre_completo}
            />
          </div>

          {/* Identificación */}
          <div>
            <Label htmlFor="identificacion">Identificación</Label>
            <InputField
              type="text"
              id="identificacion"
              name="identificacion"
              placeholder="Ingrese la identificación"
              value={formData.identificacion}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.identificacion}
              hint={errors.identificacion}
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
              value={formData.correo}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.correo}
              hint={errors.correo}
            />
          </div>

          {/* Rol y Tipo de Contrato en la misma fila */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Rol */}
            <div>
              <Label htmlFor="id_rol">Rol</Label>
              <Select
                options={roleOptions}
                placeholder="Seleccionar rol"
                onChange={handleRoleChange}
                defaultValue={formData.id_rol.toString()}
                className={errors.id_rol ? "border-red-500" : ""}
              />
              {errors.id_rol && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {errors.id_rol}
                </p>
              )}
            </div>

            {/* Tipo de Contrato */}
            <div>
              <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
              <Select
                options={contractOptions}
                placeholder="Seleccionar tipo de contrato"
                onChange={handleContractChange}
                defaultValue={formData.tipo_contrato}
                className={errors.tipo_contrato ? "border-red-500" : ""}
              />
              {errors.tipo_contrato && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {errors.tipo_contrato}
                </p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <InputField
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="Ingrese el teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.telefono}
              hint={errors.telefono}
            />
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="pass_hash">Contraseña</Label>
            <InputField
              type="password"
              id="pass_hash"
              name="pass_hash"
              placeholder="Ingrese la contraseña"
              value={formData.pass_hash}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.pass_hash}
              hint={errors.pass_hash}
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
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
