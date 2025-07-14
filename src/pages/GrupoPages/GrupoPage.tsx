import { useState, useEffect } from 'react';
import { grupoService, Grupo, UpdateGrupoPayload } from '../../api/grupo.service';
import ComponentCard from '../../components/common/ComponentCard';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import EditGrupoModal from '../../components/modals/EditGrupoModal';
import Button from '../../components/ui/button/Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';

const GrupoPage = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(1);
  const gruposPorPagina = 10;

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      setError(null);
      const userDataString = localStorage.getItem('user_data');
      if (!userDataString) {
        setError('No se encontraron datos del usuario.');
        setLoading(false);
        return;
      }
      const userData = JSON.parse(userDataString);
      const codCentro = userData.cod_centro;
      if (!codCentro) {
        setError('No se encontró el código de centro del usuario.');
        setLoading(false);
        return;
      }
      const data = await grupoService.getGruposByCentro(codCentro);
      setGrupos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los grupos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const handleEditClick = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (cod_ficha: number, updatedData: UpdateGrupoPayload) => {
    try {
      await grupoService.updateGrupo(cod_ficha, updatedData);
      setIsModalOpen(false);
      fetchGrupos();
    } catch (error) {
      console.error("Error al guardar:", error);
      throw error;
    }
  };

  const filteredGrupos = grupos.filter(grupo =>
    grupo.cod_ficha.toString().includes(searchTerm) ||
    (grupo.responsable && grupo.responsable.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPaginas = Math.ceil(filteredGrupos.length / gruposPorPagina);

  const gruposPaginados = filteredGrupos.slice(
    (paginaActual - 1) * gruposPorPagina,
    paginaActual * gruposPorPagina
  );
  
  const handleCambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const obtenerNumerosDePagina = () => {
    const paginas = [];
    const maxPaginasVisibles = 7;
    const paginasAlrededor = 2;

    if (totalPaginas <= maxPaginasVisibles) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);
      if (paginaActual - paginasAlrededor > 2) paginas.push('...');
      
      let inicio = Math.max(2, paginaActual - paginasAlrededor);
      let fin = Math.min(totalPaginas - 1, paginaActual + paginasAlrededor);

      for (let i = inicio; i <= fin; i++) paginas.push(i);
      
      if (paginaActual + paginasAlrededor < totalPaginas - 1) paginas.push('...');
      paginas.push(totalPaginas);
    }
    return paginas;
  };
  
  const numerosDePagina = obtenerNumerosDePagina();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Gestión de Grupos" />

      <ComponentCard title="Listado de Grupos de Formación" desc="Busque y administre los grupos de su centro.">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por N° de ficha o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table className="min-w-[2800px]">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ficha</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cód. Centro</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cód. Programa</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Versión</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nivel</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jornada</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fecha Inicio</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fecha Fin</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Etapa</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Modalidad</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Responsable</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Empresa</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Municipio</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Programa Especial</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Horario</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ambiente ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Acciones</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {gruposPaginados.map((grupo) => (
                      <TableRow key={grupo.cod_ficha}>
                        <TableCell className="px-5 py-4 text-start"><Badge size="sm" color="primary">{grupo.cod_ficha}</Badge></TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.cod_centro || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.cod_programa || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.la_version || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.estado_grupo || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.nombre_nivel || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.jornada || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.fecha_inicio || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.fecha_fin || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.etapa || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">{grupo.modalidad || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.responsable || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.nombre_empresa || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.nombre_municipio || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.nombre_programa_especial || 'N/A'}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 whitespace-nowrap">{grupo.hora_inicio} - {grupo.hora_fin}</TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {grupo.id_ambiente ? (<Badge size="sm" color="success">{grupo.id_ambiente}</Badge>) : (<Badge size="sm" color="light">Sin Asignar</Badge>)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start"><Button variant="outline" size="sm" onClick={() => handleEditClick(grupo)}>Editar</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* --- PAGINACIÓN RESPONSIVE --- */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 dark:bg-gray-900 dark:border-gray-800">
              {/* Vista Móvil */}
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => handleCambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handleCambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>

              {/* Vista de Escritorio */}
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Mostrando <span className="font-medium">{(paginaActual - 1) * gruposPorPagina + 1}</span> a{" "}
                    <span className="font-medium">{Math.min(paginaActual * gruposPorPagina, filteredGrupos.length)}</span> de{" "}
                    <span className="font-medium">{filteredGrupos.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                    <button onClick={() => handleCambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50">                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                    </button>
                    {numerosDePagina.map((pagina, index) =>
                      typeof pagina === 'number' ? (
                        <button key={index} onClick={() => handleCambiarPagina(pagina)} className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${paginaActual === pagina ? "z-10 bg-[#39A900] text-white" : "text-gray-900 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"} border border-gray-300 dark:border-gray-700`}>
                          {pagina}
                        </button>
                      ) : (
                        <span key={index} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span>
                      )
                    )}
                    <button onClick={() => handleCambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50">
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </ComponentCard>

      <EditGrupoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        grupoData={selectedGrupo || undefined}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default GrupoPage;