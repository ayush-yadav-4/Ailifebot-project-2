import { useEffect } from 'react';

/**
 * Custom hook for rendering MathJax in messages
 */
export function useMathJaxRenderer(containerRef, messages) {
  useEffect(() => {
    if (!containerRef.current || typeof window.MathJax === 'undefined') return;

    // Render MathJax
    if (window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
        console.error('MathJax rendering error:', err);
      });
    }
  }, [messages, containerRef]);
}

