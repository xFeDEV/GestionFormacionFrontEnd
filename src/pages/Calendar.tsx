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
import { userService, User } from "../api/user.service";
import { festivosService, FestivosResponse } from "../api/festivos.service";
import useAuth from "../hooks/useAuth";
import './calendar-styles.css';

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    programacion?: Programacion;
  };
}

interface InstructorOption {
  value: number;
  label: string;
  instructor: User;
}

interface GrupoOption {
  value: number;
  label: string;
  grupo: Grupo;
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
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<InstructorOption | null>(null);
  
  // Estados para los selects del modal
  const [fichasDisponibles, setFichasDisponibles] = useState<GrupoOption[]>([]);
  const [competencias, setCompetencias] = useState<CompetenciaOption[]>([]);
  const [resultados, setResultados] = useState<ResultadoOption[]>([]);
  const [selectedFicha, setSelectedFicha] = useState<GrupoOption | null>(null);
  const [selectedCompetencia, setSelectedCompetencia] = useState<CompetenciaOption | null>(null);
  const [selectedResultado, setSelectedResultado] = useState<ResultadoOption | null>(null);
  
  // Estados para festivos y días no laborables
  const [festivosData, setFestivosData] = useState<FestivosResponse | null>(null);
  const [fechasNoLaborables, setFechasNoLaborables] = useState<Set<string>>(new Set());
  
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Obtener información del usuario autenticado
  const user = useAuth();

  // useEffect para carga condicional basada en el rol del usuario
  useEffect(() => {
    if (!user) {
      return;
    }

    // Si el usuario es instructor, establecer automáticamente instructorSeleccionado
    if (user.nombre_rol?.toLowerCase() === 'instructor') {
      // Crear objeto InstructorOption usando los datos del usuario
      const instructorOption: InstructorOption = {
        value: user.id_usuario,
        label: user.nombre_completo,
        instructor: {
          id: user.id_usuario,
          id_usuario: user.id_usuario,
          nombre_completo: user.nombre_completo,
          correo: user.correo || user.email,
          estado: true,
          telefono: user.telefono,
          tipo_contrato: user.tipo_contrato,
          identificacion: user.identificacion,
          id_rol: user.id_rol,
          nombre_rol: user.nombre_rol
        }
      };

      setInstructorSeleccionado(instructorOption);
    }
  }, [user]); // Se ejecuta cuando cambia el usuario

  // Cargar festivos y domingos al inicializar el componente
  useEffect(() => {
    const loadFestivos = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const festivosResponse = await festivosService.getFestivosYDomingos(currentYear);
        
        setFestivosData(festivosResponse);
        
        // Crear Set de fechas no laborables para búsqueda rápida
        const fechasNoLaborablesSet = festivosService.getFechasNoLaborables(festivosResponse);
        setFechasNoLaborables(fechasNoLaborablesSet);
        
      } catch (error) {
        console.error("❌ [ERROR] Error al cargar festivos:", error);
        // En caso de error, continuar sin restricciones
        setFestivosData(null);
        setFechasNoLaborables(new Set());
      }
    };

    loadFestivos();
  }, []);

  // Función para cargar opciones de instructores de forma asíncrona
  const loadInstructorOptions = useCallback(async (inputValue: string): Promise<InstructorOption[]> => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    try {
      const instructores = await userService.getInstructores();
      
      if (!instructores || instructores.length === 0) {
        return [];
      }

      // Filtrar instructores por el texto de búsqueda
      const instructoresFiltrados = instructores.filter((instructor) =>
        instructor.nombre_completo.toLowerCase().includes(inputValue.toLowerCase()) ||
        instructor.identificacion?.toLowerCase().includes(inputValue.toLowerCase()) ||
        instructor.correo.toLowerCase().includes(inputValue.toLowerCase())
      );

      const mappedOptions = instructoresFiltrados.map((instructor) => ({
        value: instructor.id_usuario || instructor.id,
        label: `${instructor.nombre_completo} (${instructor.identificacion || 'Sin ID'}) - ${instructor.correo}`,
        instructor: instructor,
      }));

      return mappedOptions;

    } catch (error) {
      console.error("❌ [ERROR] Error al buscar instructores:", error);
      return [];
    }
  }, []);

  // Cargar eventos cuando cambie el instructor seleccionado
  useEffect(() => {
    if (instructorSeleccionado?.value) {
      reloadCalendarEvents();
    } else {
      // Limpiar eventos si no hay instructor seleccionado
      setEvents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorSeleccionado]);

  // Cargar fichas disponibles cuando cambie el instructor seleccionado
  useEffect(() => {
    const loadFichasDisponibles = async () => {
      if (instructorSeleccionado?.value) {
        try {
          const fichasData = await grupoService.getGruposPorInstructor(instructorSeleccionado.value);
          
          const fichaOptions = fichasData.map((grupo) => ({
            value: grupo.cod_ficha,
            label: `${grupo.cod_ficha} - ${grupo.nombre_programa || 'Sin programa'} (${grupo.jornada || 'Sin jornada'})`,
            grupo: grupo,
          }));
          
          setFichasDisponibles(fichaOptions);
        } catch (error) {
          console.error("❌ [ERROR] Error al cargar fichas del instructor:", error);
          setFichasDisponibles([]);
        }
      } else {
        setFichasDisponibles([]);
        setSelectedFicha(null);
        setCompetencias([]);
        setSelectedCompetencia(null);
        setResultados([]);
        setSelectedResultado(null);
      }
    };

    loadFichasDisponibles();
  }, [instructorSeleccionado]);

  // Cargar competencias cuando cambie la ficha seleccionada
  useEffect(() => {
    const loadCompetencias = async () => {
      if (selectedFicha?.grupo?.cod_programa && selectedFicha?.grupo?.la_version) {
        try {
          const competenciasData = await programacionService.getCompetenciasPorPrograma(
            selectedFicha.grupo.cod_programa,
            selectedFicha.grupo.la_version
          );
          
          const competenciaOptions = competenciasData.map((competencia) => ({
            value: competencia.cod_competencia,
            label: competencia.nombre,
          }));
          
          setCompetencias(competenciaOptions);
        } catch (error) {
          console.error("❌ [ERROR] Error al cargar competencias:", error);
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
  }, [selectedFicha]);

  // Cargar resultados cuando cambie la competencia seleccionada
  useEffect(() => {
    const loadResultados = async () => {
      if (selectedCompetencia?.value) {
        try {
          const resultadosData = await programacionService.getResultadosPorCompetencia(selectedCompetencia.value);
          
          const resultadoOptions = resultadosData.map((resultado) => ({
            value: resultado.cod_resultado,
            label: resultado.nombre,
          }));
          
          setResultados(resultadoOptions);
        } catch (error) {
          console.error("❌ [ERROR] Error al cargar resultados:", error);
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
    const fechaSeleccionada = selectInfo.startStr;
    
    // Verificar si la fecha seleccionada es un día no laborable
    if (fechasNoLaborables.has(fechaSeleccionada)) {
      let tipoFecha = "";
      if (festivosData?.festivos.includes(fechaSeleccionada)) {
        tipoFecha = "día festivo";
      } else if (festivosData?.domingos.includes(fechaSeleccionada)) {
        tipoFecha = "domingo";
      } else {
        tipoFecha = "día no laborable";
      }
      
      alert(`❌ No se puede programar en ${tipoFecha}.\n\nFecha seleccionada: ${fechaSeleccionada}\n\nPor favor, selecciona un día laborable.`);
      return; // Salir sin abrir el modal
    }
    
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    
    // Pre-rellenar horas por defecto
    setEventStartTime("08:00");
    setEventEndTime("17:00");
    
    openModal();
  };

  // Función auxiliar para cargar datos del evento de forma secuencial
  const cargarDatosEvento = async (programacionDetalle: any) => {
    try {
      // Limpiar estados anteriores
      setSelectedFicha(null);
      setSelectedCompetencia(null);
      setSelectedResultado(null);
      setCompetencias([]);
      setResultados([]);

      // 1. Primero establecer la ficha
      if (programacionDetalle.cod_ficha) {
        const fichaOption = fichasDisponibles.find(f => f.value === programacionDetalle.cod_ficha);
        if (fichaOption) {
          setSelectedFicha(fichaOption);
          
          // 2. Cargar competencias para esta ficha
          if (fichaOption.grupo?.cod_programa && fichaOption.grupo?.la_version) {
            try {
              const competenciasData = await programacionService.getCompetenciasPorPrograma(
                fichaOption.grupo.cod_programa,
                fichaOption.grupo.la_version
              );
              
              const competenciaOptions = competenciasData.map((competencia) => ({
                value: competencia.cod_competencia,
                label: competencia.nombre,
              }));
              
              setCompetencias(competenciaOptions);
              
              // 3. Establecer la competencia seleccionada
              if (programacionDetalle.cod_competencia) {
                const competenciaOption = competenciaOptions.find(c => c.value === programacionDetalle.cod_competencia);
                if (competenciaOption) {
                  setSelectedCompetencia(competenciaOption);
                  
                  // 4. Cargar resultados para esta competencia
                  try {
                    const resultadosData = await programacionService.getResultadosPorCompetencia(competenciaOption.value);
                    
                    const resultadoOptions = resultadosData.map((resultado) => ({
                      value: resultado.cod_resultado,
                      label: resultado.nombre,
                    }));
                    
                    setResultados(resultadoOptions);
                    
                    // 5. Establecer el resultado seleccionado
                    if (programacionDetalle.cod_resultado) {
                      const resultadoOption = resultadoOptions.find(r => r.value === programacionDetalle.cod_resultado);
                      if (resultadoOption) {
                        setSelectedResultado(resultadoOption);
                      }
                    }
                  } catch (error) {
                    console.error("Error al cargar resultados:", error);
                  }
                }
              }
            } catch (error) {
              console.error("Error al cargar competencias:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del evento:", error);
    }
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
      
      // Cargar datos de forma secuencial para evitar problemas de sincronización
      await cargarDatosEvento(programacionDetalle);
      
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
    if (instructorSeleccionado?.value) {
      try {
        const programaciones = await programacionService.getProgramacionesPorInstructor(instructorSeleccionado.value);
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
    if (!instructorSeleccionado?.value || !selectedFicha || !selectedCompetencia || !selectedResultado || !eventStartTime || !eventEndTime) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }

    // Calcular horas programadas
    const horaInicio = new Date(`1970-01-01T${eventStartTime}`);
    const horaFin = new Date(`1970-01-01T${eventEndTime}`);
    const horasProgramadas = Math.abs(horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);

    // Pre-validación: verificar cruces de horarios
    try {
      const validacionData = {
        id_instructor: instructorSeleccionado.value,
        fecha_programada: eventStartDate,
        hora_inicio: eventStartTime,
        hora_fin: eventEndTime,
        id_programacion_actual: selectedEvent?.id ? parseInt(selectedEvent.id) : undefined
      };

      const validacionResponse = await programacionService.validarCruceProgramacion(validacionData);
      
      if (validacionResponse.conflicto) {
        alert(`❌ Error de programación\n\n${validacionResponse.mensaje || 'Existe un conflicto de horarios con otra programación existente.'}\n\nPor favor, verifica las horas y fechas seleccionadas.`);
        return; // Detener la ejecución si hay conflicto
      }
    } catch (error) {
      console.error("Error al validar cruce de programación:", error);
      alert("Error al validar la programación. Por favor, intenta nuevamente.");
      return;
    }

    try {
      if (selectedEvent && selectedEvent.id) {
        // Actualizar evento existente
        const idProgramacion = parseInt(selectedEvent.id);
        const updateData = {
          id_instructor: instructorSeleccionado.value,
          cod_ficha: selectedFicha.value,
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
          id_instructor: instructorSeleccionado.value,
          cod_ficha: selectedFicha.value,
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
    setSelectedFicha(null);
    setSelectedCompetencia(null);
    setSelectedResultado(null);
    // No resetear instructorSeleccionado aquí para mantener la selección
  };

  const handleInstructorChange = (selectedOption: InstructorOption | null) => {
    setInstructorSeleccionado(selectedOption);
    // Limpiar selecciones de fichas y competencias cuando cambia el instructor
    setSelectedFicha(null);
    setCompetencias([]);
    setSelectedCompetencia(null);
    setResultados([]);
    setSelectedResultado(null);
  };

  const handleFichaChange = (selectedOption: GrupoOption | null) => {
    setSelectedFicha(selectedOption);
    // Limpiar selecciones de competencias y resultados cuando cambia la ficha
    setSelectedCompetencia(null);
    setSelectedResultado(null);
    
    if (selectedOption) {
      // Pre-rellenar horas de la ficha si están disponibles
      if (selectedOption.grupo?.hora_inicio && selectedOption.grupo?.hora_fin) {
        setEventStartTime(selectedOption.grupo.hora_inicio);
        setEventEndTime(selectedOption.grupo.hora_fin);
      }
    }
  };

  return (
    <>
      {/* Título principal de la página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Programacion de Instructores
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gestiona y organiza las programaciones académicas de los instructores
        </p>
      </div>

      {/* Sección del buscador de instructores - Solo visible para coordinadores y superadmin */}
      {user && user.nombre_rol?.toLowerCase() !== 'instructor' && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Buscar Instructor
              </label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadInstructorOptions}
                onChange={handleInstructorChange}
                value={instructorSeleccionado}
                placeholder="Buscar por nombre, ID o correo..."
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 2
                    ? "Escribe al menos 2 caracteres para buscar"
                    : "No se encontraron instructores"
                }
                loadingMessage={() => "Buscando instructores..."}
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
              {instructorSeleccionado && (
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  <span className="font-medium">Instructor seleccionado:</span> {instructorSeleccionado.label}
                </div>
              )}
              {selectedFicha && (
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  <span className="font-medium">Ficha seleccionada:</span> {selectedFicha.label}
                </div>
              )}
              <button
                onClick={openModal}
                disabled={!instructorSeleccionado}
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
      )}

      {/* Información del instructor actual para vista de instructor */}
      {user && user.nombre_rol?.toLowerCase() === 'instructor' && instructorSeleccionado && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mi Programación Semanal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bienvenido, {instructorSeleccionado.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Gestiona tu horario académico y programaciones de clase
              </p>
            </div>
            <div className="ml-auto">
              <button
                onClick={openModal}
                className="flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Programación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              list: 'Lista'
            }}
            titleFormat={{ 
              year: 'numeric', 
              month: 'long' 
            }}
            dayHeaderFormat={{ weekday: 'long' }}
            events={events}
            selectable={true}
            selectAllow={(selectInfo) => {
              // Función para validar si la fecha es seleccionable
              const dateStr = selectInfo.start.toISOString().split('T')[0];
              const esSeleccionable = !fechasNoLaborables.has(dateStr);
              
              return esSeleccionable;
            }}
            dayCellClassNames={(arg) => {
              // Agregar clases CSS a días no laborables para styling visual
              const dateStr = arg.date.toISOString().split('T')[0];
              const classes = [];
              
              if (fechasNoLaborables.has(dateStr)) {
                classes.push('fc-day-disabled');
                
                if (festivosData?.festivos.includes(dateStr)) {
                  classes.push('fc-day-festivo');
                } else if (festivosData?.domingos.includes(dateStr)) {
                  classes.push('fc-day-domingo');
                }
              }
              
              return classes;
            }}
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
                {instructorSeleccionado 
                  ? `Creando programación para: ${instructorSeleccionado.label}`
                  : "Configura los detalles de la programación académica"
                }
                {instructorSeleccionado && !selectedFicha && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400">
                    ⚠️ Selecciona una ficha para continuar
                  </span>
                )}
              </p>
              {/* Debug info - remove in production */}
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


                {/* Información del Instructor Seleccionado */}
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Instructor
                  </label>
                  <div className="flex h-11 w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90">
                    {instructorSeleccionado ? instructorSeleccionado.label : "No hay instructor seleccionado"}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Para cambiar el instructor, usa el buscador en la parte superior
                  </p>
                </div>

                {/* Select de Ficha */}
              <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Ficha
                </label>
                  <Select
                    options={fichasDisponibles}
                    value={selectedFicha}
                    onChange={handleFichaChange}
                    placeholder="Seleccionar ficha..."
                    noOptionsMessage={() => fichasDisponibles.length === 0 ? "No hay fichas disponibles para este instructor" : "No se encontraron fichas"}
                    isDisabled={!instructorSeleccionado}
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
                    noOptionsMessage={() => selectedFicha ? "No hay competencias disponibles" : "Primero selecciona una ficha"}
                    isDisabled={!selectedFicha}
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
                    onChange={(option) => {
                      setSelectedResultado(option);
                    }}
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
  const programacion = eventInfo.event.extendedProps?.programacion;
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  
  // Función para formatear la hora de 24h a 12h con AM/PM
  const formatearHora = (hora: string) => {
    if (!hora) return '';
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum === 0 ? 12 : horaNum > 12 ? horaNum - 12 : horaNum;
    return `${hora12}:${minutos}${ampm}`;
  };

  // Crear horario completo formateado
  const horarioCompleto = programacion?.hora_inicio && programacion?.hora_fin
    ? `${formatearHora(programacion.hora_inicio)} - ${formatearHora(programacion.hora_fin)}`
    : eventInfo.timeText || 'Sin horario';

  // Obtener nombre corto de competencia (primeras palabras)
  const competenciaCorta = programacion?.nombre_competencia 
    ? programacion.nombre_competencia.split(' ').slice(0, 3).join(' ')
    : '';

  return (
    <div
      className={`event-fc-color fc-event-main ${colorClass} w-full h-full min-h-[28px] p-1.5 rounded-md cursor-pointer hover:opacity-90 transition-all duration-200 overflow-hidden shadow-sm`}
      style={{
        fontSize: '12px',
        lineHeight: '1.3',
        maxWidth: '100%',
        wordBreak: 'break-word',
        hyphens: 'auto'
      }}
    >
      <div className="flex flex-col h-full justify-start space-y-0.5">
        {/* Primera línea: Ficha y Horas */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm truncate flex-1">
            {programacion?.cod_ficha ? `Ficha ${programacion.cod_ficha}` : 'Sin ficha'}
          </div>
          {programacion?.horas_programadas && (
            <div className="text-xs font-medium bg-white/20 px-1.5 py-0.5 rounded text-right ml-1 shrink-0">
              {programacion.horas_programadas}h
            </div>
          )}
        </div>
        
        {/* Segunda línea: Horario completo */}
        <div className="text-xs font-medium opacity-95 truncate">
          🕐 {horarioCompleto}
        </div>
        
        {/* Tercera línea: Competencia (si hay espacio) */}
        {competenciaCorta && (
          <div className="text-[11px] opacity-85 truncate hidden sm:block">
            📚 {competenciaCorta}
          </div>
        )}
        
        {/* Cuarta línea: Información adicional en eventos más grandes */}
        {programacion?.nombre_resultado && (
          <div className="text-[10px] opacity-75 truncate hidden md:block">
            ✓ {programacion.nombre_resultado.split(' ').slice(0, 4).join(' ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;