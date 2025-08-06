import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import InputField from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { Ambiente, UpdateAmbientePayload } from '../../api/ambiente.service';

interface EditAmbienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambienteData?: Ambiente;
  onSave: (updatedData: UpdateAmbientePayload) => void;
}

const EditAmbienteModal: React.FC<EditAmbienteModalProps> = ({
  isOpen,
  onClose,
  ambienteData,
  onSave
}) => {
  const [formData, setFormData] = useState<UpdateAmbientePayload>({
    nombre_ambiente: '',
    num_max_aprendices: 0,
    municipio: '',
    ubicacion: '',
    cod_centro: 0,
    estado: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Llenar el formulario cuando ambienteData cambie
  useEffect(() => {
    if (ambienteData) {
      setFormData({
        nombre_ambiente: ambienteData.nombre_ambiente || '',
        num_max_aprendices: ambienteData.num_max_aprendices || 0,
        municipio: ambienteData.municipio || '',
        ubicacion: ambienteData.ubicacion || '',
        cod_centro: ambienteData.cod_centro || 0,
        estado: ambienteData.estado ?? true
      });
    }
  }, [ambienteData]);

  // Manejar cambios en los inputs de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_max_aprendices' || name === 'cod_centro' ? Number(value) : value
    }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_ambiente?.trim()) {
      newErrors.nombre_ambiente = 'El nombre del ambiente es requerido';
    }

    if (!formData.municipio?.trim()) {
      newErrors.municipio = 'El municipio es requerido';
    }

    if (!formData.ubicacion?.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (!formData.num_max_aprendices || formData.num_max_aprendices <= 0) {
      newErrors.num_max_aprendices = 'El número máximo de aprendices debe ser mayor a 0';
    }

    if (!formData.cod_centro || formData.cod_centro <= 0) {
      newErrors.cod_centro = 'El código del centro es requerido';
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
      console.error('Error al actualizar ambiente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setFormData({
      nombre_ambiente: '',
      num_max_aprendices: 0,
      municipio: '',
      ubicacion: '',
      cod_centro: 0,
      estado: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg mx-4">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Editar Ambiente
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre del Ambiente */}
          <div>
            <Label htmlFor="nombre_ambiente">Nombre del Ambiente</Label>
            <InputField
              type="text"
              id="nombre_ambiente"
              name="nombre_ambiente"
              placeholder="Ingrese el nombre del ambiente"
              value={formData.nombre_ambiente || ''}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.nombre_ambiente}
              hint={errors.nombre_ambiente}
            />
          </div>

          {/* Número Máximo de Aprendices */}
          <div>
            <Label htmlFor="num_max_aprendices">Número Máximo de Aprendices</Label>
            <InputField
              type="number"
              id="num_max_aprendices"
              name="num_max_aprendices"
              placeholder="Ingrese el número máximo de aprendices"
              value={formData.num_max_aprendices || ''}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.num_max_aprendices}
              hint={errors.num_max_aprendices}
              min="1"
            />
          </div>

          {/* Municipio */}
          <div>
            <Label htmlFor="municipio">Municipio</Label>
            <InputField
              type="text"
              id="municipio"
              name="municipio"
              placeholder="Ingrese el municipio"
              value={formData.municipio || ''}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.municipio}
              hint={errors.municipio}
            />
          </div>

          {/* Ubicación */}
          <div>
            <Label htmlFor="ubicacion">Ubicación</Label>
            <InputField
              type="text"
              id="ubicacion"
              name="ubicacion"
              placeholder="Ingrese la ubicación"
              value={formData.ubicacion || ''}
              onChange={handleInputChange}
              disabled={loading}
              error={!!errors.ubicacion}
              hint={errors.ubicacion}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Actualizando...' : 'Actualizar Ambiente'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditAmbienteModal; 