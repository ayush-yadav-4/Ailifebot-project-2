import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for sequential loading states
 * Shows different messages at different time intervals during response generation
 * 
 * @param {boolean} isActive - Whether the loading state is active
 * @returns {string} Current loading message to display
 */
export function useSequentialLoading(isActive) {
  const [loadingMessage, setLoadingMessage] = useState('');
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Reset and start the sequence
      startTimeRef.current = Date.now();
      setLoadingMessage('Understanding your query...');

      // Update message every second to check which phase we're in
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000; // elapsed time in seconds

        if (elapsed < 4) {
          setLoadingMessage('Understanding your query...');
        } else if (elapsed < 8) {
          setLoadingMessage('Retrieving data...');
        } else if (elapsed < 12) {
          setLoadingMessage('Analyzing data...');
        } else {
          setLoadingMessage('Generating response...');
        }
      }, 100); // Check every 100ms for smooth transitions

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Reset when loading stops
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      startTimeRef.current = null;
      setLoadingMessage('');
    }
  }, [isActive]);

  return loadingMessage;
}
