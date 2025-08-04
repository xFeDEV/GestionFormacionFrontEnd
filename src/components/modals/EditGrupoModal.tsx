import React, { useState, useEffect } from 'react';
import { Grupo, UpdateGrupoPayload } from '../../api/grupo.service';
import { ambienteService, Ambiente } from '../../api/ambiente.service';
import { Modal } from '../ui/modal';
import InputField from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert';

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
  const [error, setError] = useState<string | null>(null);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [loadingAmbientes, setLoadingAmbientes] = useState(false);

  // Cargar ambientes del centro del usuario
  const cargarAmbientes = async () => {
    try {
      setLoadingAmbientes(true);
      const userDataString = localStorage.getItem("user_data");
      if (!userDataString) {
        console.error("No se encontraron datos del usuario.");
        return;
      }
      const userData = JSON.parse(userDataString);
      const codCentro = userData.cod_centro;
      if (!codCentro) {
        console.error("No se encontró el código de centro del usuario.");
        return;
      }

      const ambientesData = await ambienteService.getAmbientesActivosByCentro(codCentro);
      setAmbientes(ambientesData);
    } catch (error) {
      console.error("Error al cargar ambientes:", error);
      setError("Error al cargar los ambientes disponibles.");
    } finally {
      setLoadingAmbientes(false);
    }
  };

  // Resetear el error cuando se cierra o se abre con nuevos datos
  useEffect(() => {
    setError(null);
    if (isOpen) {
      cargarAmbientes(); // Cargar ambientes cuando se abra el modal
    }
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : null,
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
            <Label htmlFor="id_ambiente">Ambiente</Label>
            {loadingAmbientes ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#39A900] mr-2"></div>
                <span className="text-sm text-gray-500">Cargando ambientes...</span>
              </div>
            ) : (
              <select
                id="id_ambiente"
                name="id_ambiente"
                value={formData.id_ambiente ?? ''}
                onChange={handleSelectChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900] dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar ambiente</option>
                {ambientes.map((ambiente) => (
                  <option key={ambiente.id_ambiente} value={ambiente.id_ambiente}>
                    {ambiente.nombre_ambiente} - {ambiente.ubicacion}
                  </option>
                ))}
              </select>
            )}
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