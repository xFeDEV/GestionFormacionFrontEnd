import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { fileService } from "../../api/file.service";
import { FileIcon, TrashBinIcon, DownloadIcon } from "../../icons";
import useAuth from "../../hooks/useAuth";

// Constante para los roles permitidos (Superadmin y Admin)
const ALLOWED_ROLES = [1, 2]; // 1: Superadmin, 2: Admin

const CargaMasivaPage: React.FC = () => {
  // Usuario autenticado y roles permitidos
  const currentUser = useAuth();

  // Estados para el archivo PE-04
  const [selectedPe04File, setSelectedPe04File] = useState<File | null>(null);
  const [pe04Response, setPe04Response] = useState<any>(null);
  const [pe04Error, setPe04Error] = useState<string | null>(null);
  const [isPe04Loading, setIsPe04Loading] = useState<boolean>(false);

  // Estados para el archivo DF-14
  const [selectedDf14File, setSelectedDf14File] = useState<File | null>(null);
  const [df14Response, setDf14Response] = useState<any>(null);
  const [df14Error, setDf14Error] = useState<string | null>(null);
  const [isDf14Loading, setIsDf14Loading] = useState<boolean>(false);

  // Estados para el archivo Juicios Evaluativos
  const [selectedJuiciosFile, setSelectedJuiciosFile] = useState<File | null>(null);
  const [juiciosResponse, setJuiciosResponse] = useState<any>(null);
  const [juiciosError, setJuiciosError] = useState<string | null>(null);
  const [isJuiciosLoading, setIsJuiciosLoading] = useState<boolean>(false);

  // Configuración de useDropzone para PE-04
  const onDropPe04 = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedPe04File(acceptedFiles[0]);
      // Limpiar estados anteriores
      setPe04Error(null);
      setPe04Response(null);
    }
  }, []);

  const {
    getRootProps: getPe04RootProps,
    getInputProps: getPe04InputProps,
    isDragActive: isPe04DragActive,
  } = useDropzone({
    onDrop: onDropPe04,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    maxFiles: 1,
  });

  // Configuración de useDropzone para DF-14
  const onDropDf14 = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedDf14File(acceptedFiles[0]);
      // Limpiar estados anteriores
      setDf14Error(null);
      setDf14Response(null);
    }
  }, []);

  const {
    getRootProps: getDf14RootProps,
    getInputProps: getDf14InputProps,
    isDragActive: isDf14DragActive,
  } = useDropzone({
    onDrop: onDropDf14,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    maxFiles: 1,
  });

  // Configuración de useDropzone para Juicios Evaluativos
  const onDropJuicios = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedJuiciosFile(acceptedFiles[0]);
      // Limpiar estados anteriores
      setJuiciosError(null);
      setJuiciosResponse(null);
    }
  }, []);

  const {
    getRootProps: getJuiciosRootProps,
    getInputProps: getJuiciosInputProps,
    isDragActive: isJuiciosDragActive,
  } = useDropzone({
    onDrop: onDropJuicios,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    maxFiles: 1,
  });

  // Si el hook todavía está cargando el usuario, mostrar verificación
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Si el rol del usuario no está permitido, mostrar acceso denegado
  if (!currentUser.id_rol || !ALLOWED_ROLES.includes(currentUser.id_rol)) {
    return (
      <Alert
        variant="error"
        title="Acceso Denegado"
        message="No tienes los permisos necesarios para ver esta sección."
      />
    );
  }

  // Función para manejar la subida del archivo PE-04
  const handlePe04Upload = async () => {
    if (!selectedPe04File) {
      setPe04Error("Por favor, selecciona un archivo antes de subirlo.");
      return;
    }

    setIsPe04Loading(true);
    setPe04Error(null);
    setPe04Response(null);

    try {
      const response = await fileService.uploadExcelFile(selectedPe04File);
      setPe04Response(response);
      // Limpiar el archivo seleccionado después de una carga exitosa
      setSelectedPe04File(null);
    } catch (err) {
      if (err instanceof Error) {
        setPe04Error(err.message);
      } else {
        setPe04Error("Ocurrió un error inesperado al subir el archivo.");
      }
    } finally {
      setIsPe04Loading(false);
    }
  };

  // Función para manejar la subida del archivo DF-14
  const handleDf14Upload = async () => {
    if (!selectedDf14File) {
      setDf14Error("Por favor, selecciona un archivo antes de subirlo.");
      return;
    }

    setIsDf14Loading(true);
    setDf14Error(null);
    setDf14Response(null);

    try {
      const response = await fileService.uploadDf14Excel(selectedDf14File);
      setDf14Response(response);
      // Limpiar el archivo seleccionado después de una carga exitosa
      setSelectedDf14File(null);
    } catch (err) {
      if (err instanceof Error) {
        setDf14Error(err.message);
      } else {
        setDf14Error("Ocurrió un error inesperado al subir el archivo.");
      }
    } finally {
      setIsDf14Loading(false);
    }
  };

  // Función para manejar la subida del archivo Juicios Evaluativos
  const handleJuiciosUpload = async () => {
    if (!selectedJuiciosFile) {
      setJuiciosError("Por favor, selecciona un archivo antes de subirlo.");
      return;
    }

    setIsJuiciosLoading(true);
    setJuiciosError(null);
    setJuiciosResponse(null);

    try {
      const response = await fileService.uploadJuiciosEvaluativosExcel(selectedJuiciosFile);
      setJuiciosResponse(response);
      // Limpiar el archivo seleccionado después de una carga exitosa
      setSelectedJuiciosFile(null);
    } catch (err) {
      if (err instanceof Error) {
        setJuiciosError(err.message);
      } else {
        setJuiciosError("Ocurrió un error inesperado al subir el archivo.");
      }
    } finally {
      setIsJuiciosLoading(false);
    }
  };

  // Función para eliminar el archivo PE-04 seleccionado
  const handleRemovePe04File = () => {
    setSelectedPe04File(null);
    setPe04Error(null);
    setPe04Response(null);
  };

  // Función para eliminar el archivo DF-14 seleccionado
  const handleRemoveDf14File = () => {
    setSelectedDf14File(null);
    setDf14Error(null);
    setDf14Response(null);
  };

  // Función para eliminar el archivo Juicios Evaluativos seleccionado
  const handleRemoveJuiciosFile = () => {
    setSelectedJuiciosFile(null);
    setJuiciosError(null);
    setJuiciosResponse(null);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Carga Masiva de Datos" />

      {/* Tarjeta para PE-04 */}
      <ComponentCard
        title="Carga de Programas y Grupos (PE-04)"
        desc="Selecciona el archivo PE-04.xlsx para cargar los datos de programas y grupos de formación"
      >
        <div className="space-y-6">
          {/* Zona de dropzone para PE-04 */}
          <div
            {...getPe04RootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isPe04DragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <input {...getPe04InputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileIcon className="w-12 h-12 text-gray-400" />
              {isPe04DragActive ? (
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  Suelta el archivo aquí...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Arrastra y suelta el archivo <strong>PE-04.xlsx</strong>{" "}
                    aquí
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    o haz clic para seleccionar el archivo
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Solo se permiten archivos .xlsx
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Archivo PE-04 seleccionado */}
          {selectedPe04File && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPe04File.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedPe04File.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemovePe04File}
                  className="p-2"
                  disabled={isPe04Loading}
                >
                  <TrashBinIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Botón de subida para PE-04 */}
          <div className="flex justify-center">
            <Button
              onClick={handlePe04Upload}
              disabled={!selectedPe04File || isPe04Loading}
              className="px-6 py-3"
            >
              {isPe04Loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo archivo...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DownloadIcon className="w-4 h-4" />
                  <span>Subir Archivo PE-04</span>
                </div>
              )}
            </Button>
          </div>

          {/* Indicador de carga para PE-04 */}
          {isPe04Loading && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Procesando archivo PE-04, por favor espera...</span>
              </div>
            </div>
          )}

          {/* Mensaje de error para PE-04 */}
          {pe04Error && (
            <Alert
              variant="error"
              title="Error al subir archivo PE-04"
              message={pe04Error}
            />
          )}

          {/* Respuesta exitosa para PE-04 */}
          {pe04Response && (
            <Alert
              variant="success"
              title={pe04Response.mensaje}
              message={`• Regionales Procesadas: ${pe04Response.regionales_procesadas}
• Centros Procesados: ${pe04Response.centros_procesados}
• Programas Procesados: ${pe04Response.programas_procesados}
• Grupos Procesados: ${pe04Response.grupos_procesados}
• Datos de Grupo Procesados: ${pe04Response.datos_grupo_procesados}`}
            />
          )}

          {/* Errores para PE-04 */}
          {pe04Response &&
            pe04Response.errores &&
            pe04Response.errores.length > 0 && (
              <Alert
                variant="error"
                title="Errores encontrados en PE-04"
                message={pe04Response.errores.join("\n• ")}
              />
            )}
        </div>
      </ComponentCard>

      {/* Tarjeta para DF-14 */}
      <ComponentCard
        title="Carga de Duraciones y Novedades (DF-14)"
        desc="Selecciona el archivo DF-14.xlsx para cargar los datos de duraciones y novedades de formación"
      >
        <div className="space-y-6">
          {/* Zona de dropzone para DF-14 */}
          <div
            {...getDf14RootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDf14DragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <input {...getDf14InputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileIcon className="w-12 h-12 text-gray-400" />
              {isDf14DragActive ? (
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  Suelta el archivo aquí...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Arrastra y suelta el archivo <strong>DF-14.xlsx</strong>{" "}
                    aquí
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    o haz clic para seleccionar el archivo
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Solo se permiten archivos .xlsx
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Archivo DF-14 seleccionado */}
          {selectedDf14File && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedDf14File.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedDf14File.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveDf14File}
                  className="p-2"
                  disabled={isDf14Loading}
                >
                  <TrashBinIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Botón de subida para DF-14 */}
          <div className="flex justify-center">
            <Button
              onClick={handleDf14Upload}
              disabled={!selectedDf14File || isDf14Loading}
              className="px-6 py-3"
            >
              {isDf14Loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo archivo...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DownloadIcon className="w-4 h-4" />
                  <span>Subir Archivo DF-14</span>
                </div>
              )}
            </Button>
          </div>

          {/* Indicador de carga para DF-14 */}
          {isDf14Loading && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Procesando archivo DF-14, por favor espera...</span>
              </div>
            </div>
          )}

          {/* Mensaje de error para DF-14 */}
          {df14Error && (
            <Alert
              variant="error"
              title="Error al subir archivo DF-14"
              message={df14Error}
            />
          )}

          {/* Respuesta exitosa para DF-14 */}
          {df14Response && (
            <Alert
              variant="success"
              title={df14Response.mensaje}
              message={`• Programas Actualizados: ${df14Response.programas_actualizados}
• Datos de Grupo Actualizados: ${df14Response.datos_grupo_actualizados}`}
            />
          )}

          {/* Errores para DF-14 */}
          {df14Response &&
            df14Response.errores &&
            df14Response.errores.length > 0 && (
              <Alert
                variant="error"
                title="Errores encontrados en DF-14"
                message={df14Response.errores.join("\n• ")}
              />
            )}
        </div>
      </ComponentCard>

      {/* Tarjeta para Juicios Evaluativos */}
      <ComponentCard
        title="Carga de Juicios Evaluativos"
        desc="Selecciona el archivo Juicios Evaluativos.xlsx para cargar los datos de evaluaciones y juicios evaluativos"
      >
        <div className="space-y-6">
          {/* Zona de dropzone para Juicios Evaluativos */}
          <div
            {...getJuiciosRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isJuiciosDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <input {...getJuiciosInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileIcon className="w-12 h-12 text-gray-400" />
              {isJuiciosDragActive ? (
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  Suelta el archivo aquí...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Arrastra y suelta el archivo <strong>Juicios Evaluativos.xlsx</strong>{" "}
                    aquí
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    o haz clic para seleccionar el archivo
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Solo se permiten archivos .xlsx
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Archivo Juicios Evaluativos seleccionado */}
          {selectedJuiciosFile && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedJuiciosFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedJuiciosFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveJuiciosFile}
                  className="p-2"
                  disabled={isJuiciosLoading}
                >
                  <TrashBinIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Botón de subida para Juicios Evaluativos */}
          <div className="flex justify-center">
            <Button
              onClick={handleJuiciosUpload}
              disabled={!selectedJuiciosFile || isJuiciosLoading}
              className="px-6 py-3"
            >
              {isJuiciosLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo archivo...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DownloadIcon className="w-4 h-4" />
                  <span>Subir Archivo Juicios Evaluativos</span>
                </div>
              )}
            </Button>
          </div>

          {/* Indicador de carga para Juicios Evaluativos */}
          {isJuiciosLoading && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Procesando archivo Juicios Evaluativos, por favor espera...</span>
              </div>
            </div>
          )}

          {/* Mensaje de error para Juicios Evaluativos */}
          {juiciosError && (
            <Alert
              variant="error"
              title="Error al subir archivo Juicios Evaluativos"
              message={juiciosError}
            />
          )}

          {/* Respuesta exitosa para Juicios Evaluativos */}
          {juiciosResponse && (
            <Alert
              variant="success"
              title={juiciosResponse.mensaje || "Archivo procesado correctamente"}
              message={`• Ficha de Caracterización: ${juiciosResponse.ficha_caracterizacion || 'N/A'}
• Competencias Procesadas: ${juiciosResponse.competencias_procesadas || 'N/A'}
• Resultados Procesados: ${juiciosResponse.resultados_procesados || 'N/A'}
• Registros de Evaluaciones: ${juiciosResponse.registros_evaluaciones || 'N/A'}`}
            />
          )}

          {/* Errores para Juicios Evaluativos */}
          {juiciosResponse &&
            juiciosResponse.errores &&
            juiciosResponse.errores.length > 0 && (
              <Alert
                variant="error"
                title="Errores encontrados en Juicios Evaluativos"
                message={juiciosResponse.errores.join("\n• ")}
              />
            )}
        </div>
      </ComponentCard>
    </div>
  );
};

export default CargaMasivaPage;
