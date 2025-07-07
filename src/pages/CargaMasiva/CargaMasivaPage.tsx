import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import Alert from '../../components/ui/alert/Alert';
import Button from '../../components/ui/button/Button';
import { fileService } from '../../api/file.service';
import { FileIcon, TrashBinIcon, DownloadIcon } from '../../icons';

const CargaMasivaPage: React.FC = () => {
  // Estados para manejar el archivo, respuesta, error y loading
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Configuración de useDropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      // Limpiar estados anteriores
      setError(null);
      setUploadResponse(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    maxFiles: 1
  });

  // Función para manejar la subida del archivo
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo antes de subirlo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResponse(null);

    try {
      const response = await fileService.uploadExcelFile(selectedFile);
      setUploadResponse(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al subir el archivo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar el archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadResponse(null);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Carga Masiva de Datos" />
      
      <ComponentCard 
        title="Subir Archivo Excel" 
        desc="Selecciona el archivo PE-04.xlsx para cargar los datos de programas y grupos de formación"
      >
        <div className="space-y-6">
          {/* Zona de dropzone */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileIcon className="w-12 h-12 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  Suelta el archivo aquí...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Arrastra y suelta el archivo <strong>PE-04.xlsx</strong> aquí
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

          {/* Archivo seleccionado */}
          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveFile}
                  className="p-2"
                  disabled={isLoading}
                >
                  <TrashBinIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Botón de subida */}
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="px-6 py-3"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo archivo...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DownloadIcon className="w-4 h-4" />
                  <span>Subir Archivo</span>
                </div>
              )}
            </Button>
          </div>

          {/* Indicador de carga */}
          {isLoading && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Procesando archivo, por favor espera...</span>
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <Alert
              variant="error"
              title="Error al subir archivo"
              message={error}
            />
          )}

          {/* Respuesta exitosa */}
          {uploadResponse && (
            <Alert
              variant="success"
              title="¡Archivo procesado exitosamente!"
              message={`
                Datos cargados correctamente:
                • Programas insertados: ${uploadResponse.programas_insertados || 0}
                • Grupos insertados: ${uploadResponse.grupos_insertados || 0}
                ${uploadResponse.message ? `• ${uploadResponse.message}` : ''}
              `}
            />
          )}
        </div>
      </ComponentCard>
    </>
  );
};

export default CargaMasivaPage; 