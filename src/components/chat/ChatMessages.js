import React, { useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useChartRenderer } from '../../hooks/useChartRenderer';
import { useMarkdownRenderer } from '../../hooks/useMarkdownRenderer';
import { useMathJaxRenderer } from '../../hooks/useMathJaxRenderer';
import { useSequentialLoading } from '../../hooks/useSequentialLoading';

/**
 * Chat Messages Component
 * Displays all chat messages
 */
function ChatMessages({ messages, isSending = false }) {
  const containerRef = useRef(null);
  const loadingMessage = useSequentialLoading(isSending);

  // Render charts in messages
  useChartRenderer(containerRef, messages);
  
  // Render markdown in messages
  useMarkdownRenderer(containerRef, messages);
  
  // Render MathJax in messages
  useMathJaxRenderer(containerRef, messages);

  return (
    <div ref={containerRef}>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} index={index} messages={messages} />
      ))}
      
      {isSending && loadingMessage && (
        <div className="message bot-message typing-message" aria-live="polite">
          <div className="message-bubble typing-bubble">
            <div className="loading-spinner button-spinner" role="status" aria-label={loadingMessage} />
            <span className="typing-text">{loadingMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessages;

