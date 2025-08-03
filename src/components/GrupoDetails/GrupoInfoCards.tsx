import React from "react";
import ComponentCard from "../common/ComponentCard";
import Badge from "../ui/badge/Badge";
import { Grupo } from "../../api/grupo.service";

interface GrupoInfoCardsProps {
  grupo: Grupo;
}

const GrupoInfoCards: React.FC<GrupoInfoCardsProps> = ({ grupo }) => {
  // Función para formatear fechas
  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "No disponible";
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  // Función para formatear hora
  const formatearHora = (hora?: string) => {
    if (!hora) return "No disponible";
    
    // Si la hora viene en formato HH:MM:SS, extraer solo HH:MM
    if (hora.includes(":")) {
      const partes = hora.split(":");
      if (partes.length >= 2) {
        return `${partes[0]}:${partes[1]}`;
      }
    }
    
    return hora;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Tarjeta 1: Información General */}
      <ComponentCard
        title="📋 Información General"
        desc="Datos básicos del grupo de formación"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Estado del Grupo:
            </span>
            <Badge 
              size="sm" 
              color={grupo.estado_grupo === "ACTIVO" ? "success" : "light"}
            >
              {grupo.estado_grupo || "No definido"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Etapa:
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {grupo.etapa || "No definida"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Nivel:
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {grupo.nombre_nivel || "No definido"}
            </span>
          </div>

          <div className="border-t pt-3 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
              Responsable:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                <span className="text-brand-600 text-sm font-medium">
                  {grupo.responsable ? grupo.responsable.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {grupo.responsable || "No asignado"}
              </span>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Tarjeta 2: Programación y Horarios */}
      <ComponentCard
        title="📅 Programación y Horarios"
        desc="Fechas y horarios de formación"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Jornada:
            </span>
            <Badge size="sm" color="primary">
              {grupo.jornada || "No definida"}
            </Badge>
          </div>

          <div className="border-t pt-3 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">
              Período de Formación:
            </span>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Inicio:</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatearFecha(grupo.fecha_inicio)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Fin:</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatearFecha(grupo.fecha_fin)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">
              Horario Diario:
            </span>
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatearHora(grupo.hora_inicio)} - {formatearHora(grupo.hora_fin)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Horario de clases
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Tarjeta 3: Ubicación y Modalidad */}
      <ComponentCard
        title="📍 Ubicación y Modalidad"
        desc="Información de ubicación y modalidad de formación"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Modalidad:
            </span>
            <Badge 
              size="sm" 
              color={grupo.modalidad === "PRESENCIAL" ? "success" : "light"}
            >
              {grupo.modalidad || "No definida"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Municipio:
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {grupo.nombre_municipio || "No definido"}
            </span>
          </div>

          <div className="border-t pt-3 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">
              Ambiente de Formación:
            </span>
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {grupo.nombre_ambiente ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 dark:text-green-400 text-lg font-bold">
                      🏢
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {grupo.nombre_ambiente}
                  </div>
                  {grupo.id_ambiente && (
                    <div className="text-xs text-gray-500">
                      ID: {grupo.id_ambiente}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-400 text-lg">❓</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Sin ambiente asignado
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional si existe empresa */}
          {grupo.nombre_empresa && (
            <div className="border-t pt-3 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Empresa:
              </span>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  {grupo.nombre_empresa}
                </span>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
};

export default GrupoInfoCards;