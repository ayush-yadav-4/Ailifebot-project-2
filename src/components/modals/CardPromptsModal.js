import React from 'react';

/**
 * Card Prompts Modal Component
 * Displays all prompts for a specific card in a modal window
 */
function CardPromptsModal({ card, onClose, onPromptSelect }) {
  const handlePromptClick = (prompt) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="card-prompts-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="card-prompts-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`card-prompts-modal-header card-header-${card.type}`}>
          <div className="card-prompts-modal-header-content">
            <div className={`card-icon card-header-${card.type}`}>{card.icon}</div>
            <h2 className={`card-title card-header-${card.type}`}>
              {card.title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="card-prompts-modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Card Description */}
        {card.description && (
          <p className={`card-prompts-modal-description prompt-card-${card.type}`}>
            {card.description}
          </p>
        )}

        {/* Prompts List */}
        <div className={`dropdown-content-${card.type} card-prompts-list`}>
          {card.prompts && card.prompts.length > 0 ? (
            card.prompts.map((prompt, index) => (
              <div
                key={index}
                className={`dropdown-item-${card.type} card-prompt-item`}
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </div>
            ))
          ) : (
            <p className="card-prompts-empty">
              No prompts available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardPromptsModal;

