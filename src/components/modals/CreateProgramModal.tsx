import React, { useState, useEffect } from 'react';
// Rutas de importación verificadas
import { Modal } from '../ui/modal';
import InputField from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { CreateProgramPayload } from '../../api/program.service';

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProgramPayload) => void;
}

// Objeto initialState verificado, sin espacios y con guiones bajos
const initialState: CreateProgramPayload = {
  cod_programa: 0,
  la_version: 0,
  nombre: '',
  horas_lectivas: 0,
  horas_productivas: 0,
};

const CreateProgramModal: React.FC<CreateProgramModalProps> = ({ isOpen, onClose, onSave }) => {
  
  const [formData, setFormData] = useState<CreateProgramPayload>(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProgramPayload, string>>>({});

  // Hook de efecto para resetear el formulario.
  // Se añade 'initialState' a las dependencias como buena práctica.
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setErrors({});
    }
  }, [isOpen, initialState]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProgramPayload, string>> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido.';
    if (!formData.cod_programa || formData.cod_programa <= 0) newErrors.cod_programa = 'El código debe ser un número positivo.';
    if (!formData.la_version || formData.la_version <= 0) newErrors.la_version = 'La versión debe ser un número positivo.';
    if (formData.horas_lectivas <= 0) newErrors.horas_lectivas = 'Las horas deben ser mayor a 0.';
    if (formData.horas_productivas <= 0) newErrors.horas_productivas = 'Las horas deben ser mayor a 0.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? (isNaN(numericValue) ? 0 : numericValue) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Fallo al guardar el programa:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg mx-4">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Añadir Nuevo Programa
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Programa</Label>
            <InputField id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={!!errors.nombre} hint={errors.nombre} />
          </div>
          <div>
            <Label htmlFor="cod_programa">Código del Programa</Label>
            <InputField id="cod_programa" name="cod_programa" type="number" value={String(formData.cod_programa)} onChange={handleChange} error={!!errors.cod_programa} hint={errors.cod_programa} />
          </div>
          <div>
            <Label htmlFor="la_version">Versión</Label>
            <InputField id="la_version" name="la_version" type="number" value={String(formData.la_version)} onChange={handleChange} error={!!errors.la_version} hint={errors.la_version} />
          </div>
          <div>
            <Label htmlFor="horas_lectivas">Horas Lectivas</Label>
            <InputField id="horas_lectivas" name="horas_lectivas" type="number" value={String(formData.horas_lectivas)} onChange={handleChange} error={!!errors.horas_lectivas} hint={errors.horas_lectivas} />
          </div>
          <div>
            <Label htmlFor="horas_productivas">Horas Productivas</Label>
            <InputField id="horas_productivas" name="horas_productivas" type="number" value={String(formData.horas_productivas)} onChange={handleChange} error={!!errors.horas_productivas} hint={errors.horas_productivas} />
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Programa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProgramModal;