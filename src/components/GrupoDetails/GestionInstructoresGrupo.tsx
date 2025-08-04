import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { 
  grupoInstructorService, 
  InstructorDeGrupo 
} from "../../api/grupoInstructor.service";
import { userService, User } from "../../api/user.service";
import { TrashBinIcon } from "../../icons";
import ComponentCard from "../common/ComponentCard";

interface GestionInstructoresGrupoProps {
  cod_ficha: number;
}

interface InstructorOption {
  value: number;
  label: string;
  instructor: User;
}

const GestionInstructoresGrupo: React.FC<GestionInstructoresGrupoProps> = ({ 
  cod_ficha 
}) => {
  const [instructoresAsignados, setInstructoresAsignados] = useState<
    InstructorDeGrupo[]
  >([]);
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<
    InstructorOption | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [asignando, setAsignando] = useState(false);

  // Cargar instructores asignados al grupo
  const cargarInstructoresAsignados = async () => {
    try {
      setLoading(true);
      const instructores = await grupoInstructorService.getInstructoresPorGrupo(
        cod_ficha
      );
      setInstructoresAsignados(instructores);
    } catch (error) {
      console.error("Error al cargar instructores asignados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambie el cod_ficha
  useEffect(() => {
    if (cod_ficha) {
      cargarInstructoresAsignados();
    }
  }, [cod_ficha]);

  // Función para cargar opciones de instructores disponibles
  const loadInstructorOptions = async (
    inputValue: string
  ): Promise<InstructorOption[]> => {
    try {
      // Solo buscar si hay al menos 2 caracteres
      if (inputValue.length < 2) {
        return [];
      }

      // Obtener todos los instructores usando el endpoint específico
      const instructores = await userService.getInstructores();
      
      // Filtrar localmente por el input del usuario
      const instructoresFiltrados = instructores.filter((instructor) =>
        instructor.nombre_completo.toLowerCase().includes(inputValue.toLowerCase())
      );

      // Convertir a opciones del select
      console.log("🔍 [DEBUG] Instructores encontrados:", instructoresFiltrados);
      
      const opciones = instructoresFiltrados.map((instructor) => {
        // Log detallado del instructor para ver todas sus propiedades
        console.log("🔍 [DEBUG] Instructor completo:", instructor);
        console.log("🔍 [DEBUG] Propiedades del instructor:", Object.keys(instructor));
        
        // Intentar diferentes posibles nombres para el ID
        const instructorId = instructor.id_usuario || instructor.id || instructor.id_instructor || instructor.usuario_id;
        
        console.log("🔍 [DEBUG] ID encontrado:", instructorId);
        
        return {
          value: instructorId,
          label: `${instructor.nombre_completo} - ${instructor.correo}`,
          instructor: instructor,
        };
      });

      console.log("🔍 [DEBUG] Opciones mapeadas:", opciones);

      return opciones;
    } catch (error) {
      console.error("Error al buscar instructores:", error);
      return [];
    }
  };

  // Función para asignar un instructor al grupo
  const handleAsignar = async () => {
    if (!instructorSeleccionado) return;

    console.log("🔍 [DEBUG] Instructor seleccionado:", instructorSeleccionado);
    console.log("🔍 [DEBUG] cod_ficha:", cod_ficha);
    console.log("🔍 [DEBUG] instructor value:", instructorSeleccionado.value);

    // Validar que el ID del instructor no sea undefined
    if (!instructorSeleccionado.value) {
      console.error("❌ [ERROR] El ID del instructor es undefined o null");
      alert("Error: No se pudo obtener el ID del instructor seleccionado");
      return;
    }

    try {
      setAsignando(true);
      
      await grupoInstructorService.asignarInstructorAGrupo(
        cod_ficha,
        instructorSeleccionado.value
      );

      // Limpiar selección y recargar lista
      setInstructorSeleccionado(null);
      await cargarInstructoresAsignados();
      
      // Mostrar mensaje de éxito (puedes usar tu sistema de notificaciones)
      console.log("Instructor asignado correctamente");
    } catch (error) {
      console.error("Error al asignar instructor:", error);
      // Aquí podrías mostrar un toast o alerta de error
    } finally {
      setAsignando(false);
    }
  };

  // Función para desasignar un instructor del grupo
  const handleDesasignar = async (idInstructor: number, nombreInstructor: string) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas desasignar a ${nombreInstructor} de este grupo?`
    );

    if (!confirmacion) return;

    try {
      await grupoInstructorService.desasignarInstructorDeGrupo(
        cod_ficha,
        idInstructor
      );

      // Recargar lista
      await cargarInstructoresAsignados();
      
      // Mostrar mensaje de éxito
      console.log("Instructor desasignado correctamente");
    } catch (error) {
      console.error("Error al desasignar instructor:", error);
      // Aquí podrías mostrar un toast o alerta de error
    }
  };

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#39A900' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #39A900' : 'none',
      '&:hover': {
        borderColor: '#39A900',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#39A900' 
        : state.isFocused 
        ? '#f0f9ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#39A900' : '#f0f9ff',
      },
    }),
  };

  return (
    <ComponentCard title="Gestión de Instructores del Grupo">
      <div className="space-y-6">
        {/* Tabla de instructores asignados */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Instructores Asignados
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : instructoresAsignados.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay instructores asignados a este grupo
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre del Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Identificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo de Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {instructoresAsignados.map((instructor) => (
                    <tr key={instructor.id_instructor} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {instructor.nombre_completo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {instructor.correo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {instructor.identificacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {instructor.tipo_contrato}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDesasignar(instructor.id_instructor, instructor.nombre_completo)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
                          title="Desasignar instructor"
                        >
                          <TrashBinIcon className="h-4 w-4 mr-1" />
                          Desasignar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección para asignar nuevos instructores */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Asignar Nuevo
             Instructor
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar Instructor
              </label>
              <AsyncSelect<InstructorOption>
                value={instructorSeleccionado}
                onChange={setInstructorSeleccionado}
                loadOptions={loadInstructorOptions}
                placeholder="Escribe para buscar instructores..."
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 2
                    ? "Escribe al menos 2 caracteres para buscar"
                    : "No se encontraron instructores"
                }
                loadingMessage={() => "Buscando instructores..."}
                styles={customSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
                cacheOptions
                defaultOptions={false}
              />
            </div>
            
            <div>
              <button
                onClick={handleAsignar}
                disabled={!instructorSeleccionado || asignando}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                  !instructorSeleccionado || asignando
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#39A900] hover:bg-[#2d8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39A900]"
                }`}
              >
                {asignando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Asignando...
                  </>
                ) : (
                  "Asignar Instructor"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
};

export default GestionInstructoresGrupo;
