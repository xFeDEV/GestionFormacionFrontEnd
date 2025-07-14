import React, { useState, useEffect } from 'react';
import { Grupo, UpdateGrupoPayload } from '../../api/grupo.service';
import { Modal } from '../ui/modal';
import InputField from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert'; // <-- 1. Importar el componente de Alerta

interface EditGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupoData?: Grupo;
  onSave: (cod_ficha: number, updatedData: UpdateGrupoPayload) => void;
}

const EditGrupoModal: React.FC<EditGrupoModalProps> = ({
  isOpen,
  onClose,
  grupoData,
  onSave
}) => {
  const [formData, setFormData] = useState<UpdateGrupoPayload>({
    hora_inicio: '00:00:00',
    hora_fin: '00:00:00',
    id_ambiente: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // <-- 2. Estado para el mensaje de error

  // Resetear el error cuando se cierra o se abre con nuevos datos
  useEffect(() => {
    setError(null);
    if (grupoData) {
      setFormData({
        hora_inicio: grupoData.hora_inicio || '00:00:00',
        hora_fin: grupoData.hora_fin || '00:00:00',
        id_ambiente: grupoData.id_ambiente || null,
      });
    }
  }, [grupoData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'id_ambiente' ? (value ? Number(value) : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoData) return;
    
    setError(null); // Limpiar errores anteriores
    setLoading(true);

    try {
      await onSave(grupoData.cod_ficha, formData);
      onClose(); // Cerrar el modal solo si tiene éxito
    } catch (err) {
      // 3. Capturar el error y mostrarlo al usuario
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(errorMessage);
      console.error('Error al actualizar el grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg mx-4">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Editar Horario y Ambiente del Grupo
        </h2>
        <p className="text-center text-gray-500 mb-6 -mt-4">Ficha: {grupoData?.cod_ficha}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 4. Mostrar el componente de Alerta si hay un error */}
          {error && (
             <Alert
                variant="error"
                title="Error al guardar"
                message={error}
              />
          )}

          <div>
            <Label htmlFor="hora_inicio">Hora Inicio</Label>
            <InputField
              type="time"
              id="hora_inicio"
              name="hora_inicio"
              value={formData.hora_inicio || ''}
              onChange={handleInputChange}
              disabled={loading}
              step={1}
            />
          </div>

          <div>
            <Label htmlFor="hora_fin">Hora Fin</Label>
            <InputField
              type="time"
              id="hora_fin"
              name="hora_fin"
              value={formData.hora_fin || ''}
              onChange={handleInputChange}
              disabled={loading}
              step={1}
            />
          </div>

          <div>
            <Label htmlFor="id_ambiente">ID Ambiente</Label>
            <InputField
              type="number"
              id="id_ambiente"
              name="id_ambiente"
              placeholder="ID del ambiente"
              value={formData.id_ambiente ?? ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose} variant="outline" disabled={loading}>
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditGrupoModal;