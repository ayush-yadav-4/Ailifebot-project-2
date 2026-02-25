import React, { useState } from 'react';
import { globalPromptCards, extendedPromptCards } from '../../data/promptCards';
import PromptCard from '../welcome/PromptCard';
import CardPromptsModal from './CardPromptsModal';

/**
 * Prompt Gallery Modal Component
 * Modal showing all available prompt cards
 */
function PromptGalleryModal({ onClose, onPromptSelect }) {
  const [selectedCard, setSelectedCard] = useState(null);

  const handlePromptClick = (prompt) => {
    onPromptSelect(prompt);
    onClose();
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null);
  };

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          width: '800px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>CGMSCL Prompt Gallery</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        
        <div className="main-prompt-cards">
          {globalPromptCards.map((card) => (
            <PromptCard
              key={card.id}
              card={card}
              onPromptClick={handlePromptClick}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
        
        <div className="extended-cards-grid" style={{ marginTop: '24px' }}>
          {extendedPromptCards.map((card) => (
            <PromptCard
              key={card.id}
              card={card}
              onPromptClick={handlePromptClick}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>

      {/* Card Prompts Modal - shown when a card is clicked */}
      {selectedCard && (
        <CardPromptsModal
          card={selectedCard}
          onClose={handleCloseCardModal}
          onPromptSelect={handlePromptClick}
        />
      )}
    </div>
  );
}

export default PromptGalleryModal;

