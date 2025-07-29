import { apiClient } from './apiClient';

export interface FestivosResponse {
  festivos: string[];
  domingos: string[];
  total_dias: number;
}

export const festivosService = {
  /**
   * Obtiene los días festivos y domingos
   * @param year Año para filtrar (opcional, por defecto año actual)
   * @returns Promise<FestivosResponse>
   */
  getFestivosYDomingos: async (year?: number): Promise<FestivosResponse> => {
    console.log("🎄 [DEBUG] Obteniendo festivos y domingos para año:", year || "actual");
    
    const endpoint = year 
      ? `/festivos/festivos-y-domingos?year=${year}`
      : '/festivos/festivos-y-domingos';
    
    const response = await apiClient(endpoint, 'GET');
    
    console.log("📅 [DEBUG] Festivos y domingos recibidos:", response);
    return response;
  },

  /**
   * Verifica si una fecha es festivo o domingo
   * @param date Fecha en formato YYYY-MM-DD
   * @param festivosData Datos de festivos y domingos
   * @returns boolean
   */
  esFestivoODomingo: (date: string, festivosData: FestivosResponse): boolean => {
    return festivosData.festivos.includes(date) || festivosData.domingos.includes(date);
  },

  /**
   * Obtiene todas las fechas no laborables (festivos + domingos) como un Set para búsqueda rápida
   * @param festivosData Datos de festivos y domingos
   * @returns Set<string>
   */
  getFechasNoLaborables: (festivosData: FestivosResponse): Set<string> => {
    const fechasNoLaborables = new Set<string>();
    
    // Agregar festivos
    festivosData.festivos.forEach(fecha => fechasNoLaborables.add(fecha));
    
    // Agregar domingos
    festivosData.domingos.forEach(fecha => fechasNoLaborables.add(fecha));
    
    return fechasNoLaborables;
  }
};
