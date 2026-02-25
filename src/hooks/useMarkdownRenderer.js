import { useEffect } from 'react';

/**
 * Custom hook for rendering markdown in messages
 */
export function useMarkdownRenderer(containerRef, messages) {
  useEffect(() => {
    if (!containerRef.current || typeof window.marked === 'undefined') return;

    // Render markdown in message text
    const messageTexts = containerRef.current.querySelectorAll('.message-text');
    messageTexts.forEach(element => {
      if (!element.dataset.markdownRendered) {
        const html = window.marked.parse(element.textContent);
        element.innerHTML = html;
        element.dataset.markdownRendered = 'true';
      }
    });

    // Process tables after rendering - wrap them and add classes
    processTables(containerRef.current);
  }, [messages, containerRef]);

  /**
   * Process tables: wrap in scroll containers and add markdown-table class
   */
  function processTables(container) {
    if (!container) return;

    const messageBubbles = container.querySelectorAll('.message-bubble');
    messageBubbles.forEach(bubble => {
      const tables = bubble.querySelectorAll('table:not(.table-scroll-container table)');
      tables.forEach(table => {
        // Add markdown-table class if not present
        if (!table.classList.contains('markdown-table')) {
          table.classList.add('markdown-table');
        }

        // Wrap in scroll container if not already wrapped
        if (table.parentElement && !table.parentElement.classList.contains('table-scroll-container')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-scroll-container';
          wrapper.setAttribute('data-scroll-container', 'true');
          table.parentNode.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
      });
    });
  }
}

