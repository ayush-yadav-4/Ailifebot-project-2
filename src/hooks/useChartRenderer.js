import { useEffect } from 'react';
import { renderChartsInElement } from '../utils/chartUtils';

/**
 * Custom hook for rendering charts in messages
 */
export function useChartRenderer(containerRef, messages) {
  useEffect(() => {
    if (!containerRef.current) return;

    // Wait for chart libraries to load
    const checkLibraries = setInterval(() => {
      if (typeof window.echarts !== 'undefined' || typeof window.Plotly !== 'undefined') {
        clearInterval(checkLibraries);
        renderChartsInElement(containerRef.current);
      }
    }, 100);

    return () => clearInterval(checkLibraries);
  }, [messages, containerRef]);
}

