import { useState, useEffect } from 'react';

/**
 * Custom hook for chat functionality
 */
export function useChat() {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  const addMessage = (message) => {
    setChatHistory(prev => {
      const updated = [...prev, message];
      localStorage.setItem('chatHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  return { chatHistory, addMessage, clearHistory };
}

