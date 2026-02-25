import React from 'react';

/**
 * Prompt Card Component
 * Displays a prompt card that opens a modal when clicked
 */
function PromptCard({ card, onPromptClick, onCardClick }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div 
      className={`prompt-card-${card.type}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={`card-header-${card.type}`}>
        <div className="card-icon">{card.icon}</div>
        <h3 className="card-title">{card.title}</h3>
        <button 
          className="dropdown-toggle" 
          aria-label="View prompts"
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          <i 
            className="fa fa-chevron-right"
            style={{ color: '#6B7280' }}
          ></i>
        </button>
      </div>
      <p className="card-description">{card.description}</p>
    </div>
  );
}

export default PromptCard;

