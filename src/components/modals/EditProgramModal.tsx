import React, { useState, useEffect } from 'react';
// --- CORRECCIÓN 1: Rutas de importación precisas ---
import { Modal } from '../ui/modal'; // La carpeta es 'modal' en minúscula
import InputField from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { Program, UpdateProgramPayload } from '../../api/program.service'; // Importamos la interfaz correcta

interface EditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: UpdateProgramPayload) => void; // onSave recibe el payload específico de actualización
  programData?: Program; // El tipo de la prop es Program
}

const EditProgramModal: React.FC<EditProgramModalProps> = ({
  isOpen,
  onClose,
  onSave,
  programData,
}) => {
  // --- CORRECCIÓN 2: El estado del formulario solo debe contener los campos editables ---
  const [formData, setFormData] = useState<UpdateProgramPayload>({
    horas_lectivas: 0,
    horas_productivas: 0,
  });
  const [loading, setLoading] = useState(false);

  // Usamos useEffect para rellenar el formulario cuando programData cambie
  useEffect(() => {
    if (programData) {
      setFormData({
        horas_lectivas: programData.horas_lectivas,
        horas_productivas: programData.horas_productivas,
      });
    }
  }, [programData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0, // Aseguramos que el valor sea un número
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose(); // Cierra el modal en caso de éxito
    } catch (error) {
      console.error('Fallo al actualizar el programa:', error);
      // Aquí podrías añadir un estado de error para mostrar un mensaje al usuario
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg mx-4">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Editar Programa de Formación
        </h2>
        
        <div className="space-y-4">
          {/* --- CORRECCIÓN 3: Campos de solo lectura --- */}
          <div>
            <Label htmlFor="nombre">Nombre del Programa</Label>
            <InputField
              id="nombre"
              name="nombre"
              value={programData?.nombre ?? ''}
              disabled // Este campo no es editable
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="cod_programa">Código</Label>
            <InputField
              id="cod_programa"
              name="cod_programa"
              value={programData?.cod_programa?.toString() ?? ''}
              disabled // Este campo no es editable
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* --- Campos Editables --- */}
          <div>
            <Label htmlFor="horas_lectivas">Horas Lectivas</Label>
            <InputField
              id="horas_lectivas"
              name="horas_lectivas"
              type="number"
              value={formData.horas_lectivas.toString()}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="horas_productivas">Horas Productivas</Label>
            <InputField
              id="horas_productivas"
              name="horas_productivas"
              type="number"
              value={formData.horas_productivas.toString()}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProgramModal;