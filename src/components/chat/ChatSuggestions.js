import React from 'react';

/**
 * Chat Suggestions Component
 * Prompt gallery button for accessing prompt templates.
 */
function ChatSuggestions({ onOpenPromptGallery }) {
  return (
    <button
      className="floating-gallery-btn"
      type="button"
      onClick={onOpenPromptGallery}
      aria-label="Open prompt gallery"
      title="Open prompt gallery"
      style={{ animationDelay: '0.4s' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default ChatSuggestions;

