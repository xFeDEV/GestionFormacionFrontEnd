import React, { useState, useEffect } from "react";
import { grupoInstructorService, GrupoDeInstructor } from "../../../api/grupoInstructor.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import useAuth from "../../../hooks/useAuth";

const GruposInstructorTable: React.FC = () => {
  // Usuario autenticado
  const currentUser = useAuth();
  
  const [grupos, setGrupos] = useState<GrupoDeInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los grupos del instructor
  const cargarGruposInstructor = async () => {
    if (!currentUser?.id_usuario) {
      setError("No se pudo obtener la información del usuario.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [DEBUG] Cargando grupos para instructor:', currentUser.id_usuario);
      
      const gruposData = await grupoInstructorService.getGruposPorInstructor(currentUser.id_usuario);
      
      console.log('✅ [DEBUG] Grupos obtenidos:', gruposData);
      
      setGrupos(gruposData);
    } catch (err) {
      console.error('❌ [ERROR] Error al cargar grupos del instructor:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Error al cargar los grupos asignados."
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando se monte el componente
  useEffect(() => {
    if (currentUser) {
      cargarGruposInstructor();
    }
  }, [currentUser]);

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  // Función para obtener color del badge según el estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'ejecucion':
        return 'success';
      case 'finalizado':
      case 'terminado':
        return 'light';
      case 'suspendido':
      case 'cancelado':
        return 'error';
      default:
        return 'primary';
    }
  };

  // Función para obtener color del badge según la etapa
  const getEtapaColor = (etapa: string) => {
    switch (etapa.toLowerCase()) {
      case 'lectiva':
        return 'primary';
      case 'productiva':
        return 'success';
      case 'seguimiento':
        return 'warning';
      default:
        return 'light';
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900] mb-4"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargando grupos asignados...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Obteniendo información de sus grupos
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button 
            onClick={cargarGruposInstructor}
            className="mt-4 px-4 py-2 bg-[#39A900] text-white rounded-md hover:bg-[#2d8000] transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : grupos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">No tienes grupos asignados</p>
            <p className="text-sm">
              Actualmente no tienes grupos de formación asignados. Contacta con el coordinador académico si crees que esto es un error.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Ficha
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Programa
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Centro
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Etapa
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Jornada
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Fecha Inicio
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Fecha Fin
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {grupos.map((grupo) => (
                    <TableRow key={grupo.cod_ficha}>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color="primary">
                          {grupo.cod_ficha}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {grupo.nombre_programa}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                        {grupo.nombre_centro}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={getEstadoColor(grupo.estado_grupo)}>
                          {grupo.estado_grupo}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={getEtapaColor(grupo.etapa)}>
                          {grupo.etapa}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                        {grupo.jornada}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatearFecha(grupo.fecha_inicio)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatearFecha(grupo.fecha_fin)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Total de grupos asignados: <strong className="text-gray-900 dark:text-white">{grupos.length}</strong>
              </span>
              <span>
                Última actualización: {new Date().toLocaleString('es-ES')}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GruposInstructorTable;
