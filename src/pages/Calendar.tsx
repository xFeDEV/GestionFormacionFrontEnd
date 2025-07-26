import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import { grupoService, Grupo } from "../api/grupo.service";
import { programacionService, Programacion } from "../api/programacion.service";
import { userService } from "../api/user.service";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    programacion?: Programacion;
  };
}

interface GrupoOption {
  value: number;
  label: string;
  grupo: Grupo;
}

interface InstructorOption {
  value: number;
  label: string;
}

interface CompetenciaOption {
  value: number;
  label: string;
}

interface ResultadoOption {
  value: number;
  label: string;
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState<GrupoOption | null>(null);
  
  // Estados para los selects del modal
  const [instructores, setInstructores] = useState<InstructorOption[]>([]);
  const [competencias, setCompetencias] = useState<CompetenciaOption[]>([]);
  const [resultados, setResultados] = useState<ResultadoOption[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorOption | null>(null);
  const [selectedCompetencia, setSelectedCompetencia] = useState<CompetenciaOption | null>(null);
  const [selectedResultado, setSelectedResultado] = useState<ResultadoOption | null>(null);
  
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Función para cargar opciones de grupos de forma asíncrona
  const loadGrupoOptions = useCallback(async (inputValue: string): Promise<GrupoOption[]> => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    try {
      const grupos = await grupoService.searchGrupos(inputValue);
      
      if (!grupos || grupos.length === 0) {
        return [];
      }

      const mappedOptions = grupos.map((grupo) => ({
        value: grupo.cod_ficha,
        label: `${grupo.cod_ficha} - ${grupo.nombre_programa || 'Sin programa'} (${grupo.jornada || 'Sin jornada'})`,
        grupo: grupo,
      }));

      return mappedOptions;

    } catch (error) {
      console.error("Error al buscar grupos:", error);
      return [];
    }
  }, []);

  // Cargar instructores al inicializar el componente
  useEffect(() => {
    const loadInstructores = async () => {
      try {
        const instructoresData = await userService.getInstructores();
        const instructorOptions = instructoresData.map((instructor) => ({
          value: instructor.id,
          label: instructor.nombre_completo,
        }));
        setInstructores(instructorOptions);
      } catch (error) {
        console.error("Error al cargar instructores:", error);
      }
    };

    loadInstructores();
  }, []);

  // Cargar eventos cuando cambie la ficha seleccionada
  useEffect(() => {
    if (fichaSeleccionada?.value) {
      reloadCalendarEvents();
    } else {
      // Limpiar eventos si no hay ficha seleccionada
      setEvents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichaSeleccionada]);

  // Cargar competencias cuando cambie la ficha seleccionada
  useEffect(() => {
    const loadCompetencias = async () => {
      if (fichaSeleccionada?.grupo?.cod_programa && fichaSeleccionada?.grupo?.la_version) {
        try {
          const competenciasData = await programacionService.getCompetenciasPorPrograma(
            fichaSeleccionada.grupo.cod_programa,
            fichaSeleccionada.grupo.la_version
          );
          const competenciaOptions = competenciasData.map((competencia) => ({
            value: competencia.cod_competencia,
            label: competencia.nombre_competencia,
          }));
          setCompetencias(competenciaOptions);
        } catch (error) {
          console.error("Error al cargar competencias:", error);
          setCompetencias([]);
        }
      } else {
        setCompetencias([]);
        setSelectedCompetencia(null);
        setResultados([]);
        setSelectedResultado(null);
      }
    };

    loadCompetencias();
  }, [fichaSeleccionada]);

  // Cargar resultados cuando cambie la competencia seleccionada
  useEffect(() => {
    const loadResultados = async () => {
      if (selectedCompetencia?.value) {
        try {
          const resultadosData = await programacionService.getResultadosPorCompetencia(selectedCompetencia.value);
          const resultadoOptions = resultadosData.map((resultado) => ({
            value: resultado.cod_resultado,
            label: resultado.nombre_resultado,
          }));
          setResultados(resultadoOptions);
        } catch (error) {
          console.error("Error al cargar resultados:", error);
          setResultados([]);
        }
      } else {
        setResultados([]);
        setSelectedResultado(null);
      }
    };

    loadResultados();
  }, [selectedCompetencia]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    
    // Pre-rellenar horas de la ficha seleccionada si existe
    if (fichaSeleccionada?.grupo) {
      setEventStartTime(fichaSeleccionada.grupo.hora_inicio || "08:00");
      setEventEndTime(fichaSeleccionada.grupo.hora_fin || "17:00");
    }
    
    openModal();
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const idProgramacion = event.id;
    
    try {
      // Obtener detalle actualizado de la programación
      const programacionDetalle = await programacionService.getProgramacionDetalle(parseInt(idProgramacion));
      
      setSelectedEvent(event as unknown as CalendarEvent);
      setEventStartDate(event.start?.toISOString().split("T")[0] || "");
      setEventEndDate(event.end?.toISOString().split("T")[0] || "");
      setEventStartTime(programacionDetalle.hora_inicio || "");
      setEventEndTime(programacionDetalle.hora_fin || "");
      
      // Establecer valores en los selects
      if (programacionDetalle.id_instructor) {
        const instructorOption = instructores.find(i => i.value === programacionDetalle.id_instructor);
        setSelectedInstructor(instructorOption || null);
      }
      
      if (programacionDetalle.cod_competencia) {
        const competenciaOption = competencias.find(c => c.value === programacionDetalle.cod_competencia);
        setSelectedCompetencia(competenciaOption || null);
      }
      
      if (programacionDetalle.cod_resultado) {
        const resultadoOption = resultados.find(r => r.value === programacionDetalle.cod_resultado);
        setSelectedResultado(resultadoOption || null);
      }
      
      openModal();
        } catch (error) {
      console.error("Error al cargar detalle de la programación:", error);
      // Fallback al comportamiento anterior
      setSelectedEvent(event as unknown as CalendarEvent);
      setEventStartDate(event.start?.toISOString().split("T")[0] || "");
      setEventEndDate(event.end?.toISOString().split("T")[0] || "");
      openModal();
    }
  };

  // Función para recargar eventos del calendario
  const reloadCalendarEvents = async () => {
    if (fichaSeleccionada?.value) {
      try {
        const programaciones = await programacionService.getProgramacionesPorFicha(fichaSeleccionada.value);
        const calendarEvents: CalendarEvent[] = programaciones.map((programacion: any) => ({
          id: programacion.id_programacion?.toString() || Math.random().toString(),
          title: `${programacion.nombre_instructor}`,
          start: `${programacion.fecha_programada}T${programacion.hora_inicio}`,
          end: `${programacion.fecha_programada}T${programacion.hora_fin}`,
          extendedProps: {
            calendar: "Primary",
            programacion: programacion,
          },
        }));
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error al recargar eventos:", error);
        setEvents([]);
      }
    }
  };

  const handleAddOrUpdateEvent = async () => {
    if (!fichaSeleccionada?.value || !selectedInstructor || !selectedCompetencia || !selectedResultado || !eventStartTime || !eventEndTime) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }

    // Calcular horas programadas
    const horaInicio = new Date(`1970-01-01T${eventStartTime}`);
    const horaFin = new Date(`1970-01-01T${eventEndTime}`);
    const horasProgramadas = Math.abs(horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);

    try {
      if (selectedEvent && selectedEvent.id) {
        // Actualizar evento existente
        const idProgramacion = parseInt(selectedEvent.id);
        const updateData = {
          id_instructor: selectedInstructor.value,
          cod_ficha: fichaSeleccionada.value,
          fecha_programada: eventStartDate,
          horas_programadas: horasProgramadas,
          hora_inicio: eventStartTime,
          hora_fin: eventEndTime,
          cod_competencia: selectedCompetencia.value,
          cod_resultado: selectedResultado.value,
        };
        await programacionService.actualizarProgramacion(idProgramacion, updateData);
    } else {
        // Crear nuevo evento
        const createData = {
          id_instructor: selectedInstructor.value,
          cod_ficha: fichaSeleccionada.value,
          fecha_programada: eventStartDate,
          horas_programadas: horasProgramadas,
          hora_inicio: eventStartTime,
          hora_fin: eventEndTime,
          cod_competencia: selectedCompetencia.value,
          cod_resultado: selectedResultado.value,
        };
        await programacionService.crearProgramacion(createData);
      }
      
      // Recargar eventos de la ficha para refrescar el calendario
      await reloadCalendarEvents();
      
      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Error al guardar la programación:", error);
      alert("Error al guardar la programación. Por favor, intenta nuevamente.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta programación?");
    if (!confirmDelete) return;

    try {
      const idProgramacion = parseInt(selectedEvent.id);
      await programacionService.eliminarProgramacion(idProgramacion);
      
      // Recargar eventos de la ficha para refrescar el calendario
      await reloadCalendarEvents();
      
    closeModal();
    resetModalFields();
    } catch (error) {
      console.error("Error al eliminar la programación:", error);
      alert("Error al eliminar la programación. Por favor, intenta nuevamente.");
    }
  };

  const resetModalFields = () => {
    setEventStartDate("");
    setEventEndDate("");
    setEventStartTime("");
    setEventEndTime("");
    setSelectedEvent(null);
    setSelectedInstructor(null);
    setSelectedCompetencia(null);
    setSelectedResultado(null);
    // No resetear fichaSeleccionada aquí para mantener la selección
  };

  const handleFichaChange = (selectedOption: GrupoOption | null) => {
    setFichaSeleccionada(selectedOption);
    // Limpiar selecciones de competencias y resultados cuando cambia la ficha
    setSelectedCompetencia(null);
    setSelectedResultado(null);
    
    if (selectedOption) {
      setEventStartTime(selectedOption.grupo.hora_inicio || "08:00");
      setEventEndTime(selectedOption.grupo.hora_fin || "17:00");
    }
  };

  return (
    <>
      {/* Barra de herramientas superior */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Buscar Ficha
            </label>
            <AsyncSelect
              cacheOptions
              loadOptions={loadGrupoOptions}
              onChange={handleFichaChange}
              value={fichaSeleccionada}
              placeholder="Buscar por código de ficha, programa o jornada..."
              noOptionsMessage={({ inputValue }) =>
                inputValue.length < 2
                  ? "Escribe al menos 2 caracteres para buscar"
                  : "No se encontraron fichas"
              }
              loadingMessage={() => "Buscando fichas..."}
              defaultOptions={false}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '44px',
                  backgroundColor: 'transparent',
                  borderColor: '#d1d5db',
                  '&:hover': {
                    borderColor: '#d1d5db',
                  },
                  '&:focus-within': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9ca3af',
                  fontSize: '14px',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#374151',
                  fontSize: '14px',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? '#3b82f6'
                    : state.isFocused
                    ? '#eff6ff'
                    : 'white',
                  color: state.isSelected ? 'white' : '#374151',
                  fontSize: '14px',
                  padding: '8px 12px',
                }),
              }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {fichaSeleccionada && (
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <span className="font-medium">Ficha seleccionada:</span> {fichaSeleccionada.label}
              </div>
            )}
            <button
              onClick={openModal}
              disabled={!fichaSeleccionada}
              className="flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Programación
            </button>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Editar Programación" : "Nueva Programación"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fichaSeleccionada 
                  ? `Programación para: ${fichaSeleccionada.label}`
                  : "Configura los detalles de la programación académica"
                }
              </p>
              {selectedEvent?.extendedProps?.programacion && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="text-sm">
                    <div className="font-medium text-blue-800 dark:text-blue-300">
                      📅 {selectedEvent.extendedProps.programacion.fecha_programada}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 mt-1">
                      ⏱️ {selectedEvent.extendedProps.programacion.horas_programadas} horas programadas
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8">
              <div>


                {/* Select de Instructor */}
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Instructor
                  </label>
                  <Select
                    options={instructores}
                    value={selectedInstructor}
                    onChange={setSelectedInstructor}
                    placeholder="Seleccionar instructor..."
                    noOptionsMessage={() => "No hay instructores disponibles"}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '44px',
                        backgroundColor: 'transparent',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#d1d5db',
                        },
                        '&:focus-within': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        },
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#9ca3af',
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: '#374151',
                        fontSize: '14px',
                      }),
                    }}
                  />
              </div>

                {/* Select de Competencia */}
              <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Competencia
                </label>
                  <Select
                    options={competencias}
                    value={selectedCompetencia}
                    onChange={(option) => {
                      setSelectedCompetencia(option);
                      setSelectedResultado(null); // Limpiar resultado cuando cambie competencia
                    }}
                    placeholder="Seleccionar competencia..."
                    noOptionsMessage={() => fichaSeleccionada ? "No hay competencias disponibles" : "Primero selecciona una ficha"}
                    isDisabled={!fichaSeleccionada}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '44px',
                        backgroundColor: 'transparent',
                        borderColor: state.isDisabled ? '#e5e7eb' : '#d1d5db',
                        opacity: state.isDisabled ? 0.5 : 1,
                        '&:hover': {
                          borderColor: state.isDisabled ? '#e5e7eb' : '#d1d5db',
                        },
                        '&:focus-within': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        },
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#9ca3af',
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: '#374151',
                        fontSize: '14px',
                      }),
                    }}
                            />
                </div>

                {/* Select de Resultado de Aprendizaje */}
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Resultado de Aprendizaje
                        </label>
                  <Select
                    options={resultados}
                    value={selectedResultado}
                    onChange={setSelectedResultado}
                    placeholder="Seleccionar resultado..."
                    noOptionsMessage={() => selectedCompetencia ? "No hay resultados disponibles" : "Primero selecciona una competencia"}
                    isDisabled={!selectedCompetencia}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '44px',
                        backgroundColor: 'transparent',
                        borderColor: state.isDisabled ? '#e5e7eb' : '#d1d5db',
                        opacity: state.isDisabled ? 0.5 : 1,
                        '&:hover': {
                          borderColor: state.isDisabled ? '#e5e7eb' : '#d1d5db',
                        },
                        '&:focus-within': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        },
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#9ca3af',
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: '#374151',
                        fontSize: '14px',
                      }),
                    }}
                  />
                </div>
              </div>


              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha de Inicio
                </label>
                  <input
                    id="event-start-date"
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha de Fin
                </label>
                  <input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Hora de Inicio
                  </label>
                  <input
                    id="event-start-time"
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Hora de Fin
                  </label>
                  <input
                    id="event-end-time"
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Cerrar
              </button>
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  type="button"
                  className="flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Actualizar" : "Crear Programación"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
