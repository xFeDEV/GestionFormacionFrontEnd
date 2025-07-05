import React, { useState, useEffect } from 'react';
import { User, UpdateUserPayload } from '../../api/user.service';
import Button from '../ui/button/Button';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: User;
  onSave: (updatedData: UpdateUserPayload) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSave
}) => {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    nombre_completo: '',
    correo: '',
    telefono: '',
    tipo_contrato: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<UpdateUserPayload>>({});

  // Llenar el formulario cuando userData cambie
  useEffect(() => {
    if (userData) {
      setFormData({
        nombre_completo: userData.nombre_completo || '',
        correo: userData.correo || '',
        telefono: userData.telefono || '',
        tipo_contrato: userData.tipo_contrato || ''
      });
    }
  }, [userData]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[name as keyof UpdateUserPayload]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateUserPayload> = {};

    if (!formData.nombre_completo?.trim()) {
      newErrors.nombre_completo = 'El nombre completo es requerido';
    }

    if (!formData.correo?.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.tipo_contrato?.trim()) {
      newErrors.tipo_contrato = 'El tipo de contrato es requerido';
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
      console.error('Error al actualizar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setFormData({
      nombre_completo: '',
      correo: '',
      telefono: '',
      tipo_contrato: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Editar Usuario
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre Completo */}
          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre_completo"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.nombre_completo ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.nombre_completo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre_completo}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.correo ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.correo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.correo}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
            )}
          </div>

          {/* Tipo de Contrato */}
          <div>
            <label htmlFor="tipo_contrato" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Contrato
            </label>
            <select
              id="tipo_contrato"
              name="tipo_contrato"
              value={formData.tipo_contrato}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.tipo_contrato ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Seleccionar tipo de contrato</option>
              <option value="Indefinido">Indefinido</option>
              <option value="Temporal">Temporal</option>
              <option value="Prácticas">Prácticas</option>
              <option value="Freelance">Freelance</option>
            </select>
            {errors.tipo_contrato && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tipo_contrato}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal; 