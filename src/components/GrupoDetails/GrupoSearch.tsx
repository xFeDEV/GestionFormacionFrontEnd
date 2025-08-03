import React from "react";
import AsyncSelect from "react-select/async";
import { grupoService, Grupo } from "../../api/grupo.service";

interface GrupoSearchProps {
  onGrupoSelect: (grupo: Grupo) => Promise<void>;
}

interface OptionType {
  value: number;
  label: string;
  grupo: Grupo;
}

const GrupoSearch: React.FC<GrupoSearchProps> = ({ onGrupoSelect }) => {
  // Función para cargar opciones basada en el input del usuario
  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    try {
      // Solo buscar si hay al menos 2 caracteres
      if (inputValue.length < 2) {
        return [];
      }

      // Llamar al servicio de búsqueda
      const grupos = await grupoService.searchGrupos(inputValue, 15);
      
      // Transformar los grupos en opciones para el select
      return grupos.map((grupo) => ({
        value: grupo.cod_ficha,
        label: `${grupo.cod_ficha} - ${grupo.nombre_programa || 'Programa no definido'} (Responsable: ${grupo.responsable || 'Sin responsable'})`,
        grupo: grupo,
      }));
    } catch (error) {
      console.error("Error al buscar grupos:", error);
      return [];
    }
  };

  // Función que se ejecuta cuando el usuario selecciona un grupo
  const handleChange = async (selectedOption: OptionType | null) => {
    if (selectedOption) {
      await onGrupoSelect(selectedOption.grupo);
    }
  };

  // Estilos personalizados para react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#39A900' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(57, 169, 0, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#39A900',
      },
      minHeight: '42px',
      fontSize: '14px',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '14px',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#39A900' 
        : state.isFocused 
        ? '#f3f4f6' 
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '12px 16px',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#39A900' : '#f3f4f6',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '4px',
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '14px',
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '14px',
    }),
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🔍 Buscar Grupo de Formación
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Escriba el número de ficha, nombre del programa, responsable o ambiente para buscar
        </p>
      </div>
      
      <AsyncSelect<OptionType>
        cacheOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        placeholder="Escriba al menos 2 caracteres para buscar..."
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2
            ? "Escriba al menos 2 caracteres"
            : "No se encontraron grupos"
        }
        loadingMessage={() => "Buscando grupos..."}
        styles={customStyles}
        isClearable
        escapeClearsValue
        className="react-select-container"
        classNamePrefix="react-select"
      />
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        💡 <strong>Consejo:</strong> Puede buscar por número de ficha (ej: "2847248"), nombre del programa, responsable o ambiente
      </div>
    </div>
  );
};

export default GrupoSearch;