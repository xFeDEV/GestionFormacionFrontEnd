import { useState, useEffect } from "react";

/**
 * Hook personalizado para detectar cambios en media queries
 * Útil para implementar diseño responsivo en React
 *
 * @param query - La consulta de medios CSS (ej: '(max-width: 768px)')
 * @returns boolean - true si la consulta coincide, false si no
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 */
const useMediaQuery = (query: string): boolean => {
  // Estado para almacenar si la consulta coincide
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si window está disponible (SSR safety)
    if (typeof window === "undefined") {
      return;
    }

    // Crear el objeto MediaQueryList
    const mediaQueryList = window.matchMedia(query);

    // Función que actualiza el estado cuando cambia la consulta
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Establecer el valor inicial
    setMatches(mediaQueryList.matches);

    // Escuchar cambios en la consulta de medios
    // Usar el método correcto según la compatibilidad del navegador
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange);
    } else {
      // Fallback para navegadores más antiguos
      mediaQueryList.addListener(handleChange);
    }

    // Función de limpieza para remover el listener
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleChange);
      } else {
        // Fallback para navegadores más antiguos
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]); // Re-ejecutar si la consulta cambia

  return matches;
};

export default useMediaQuery;
