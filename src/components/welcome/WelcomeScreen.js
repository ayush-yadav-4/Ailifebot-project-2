import React, { useState, useRef } from 'react';
import TopRightControls from './TopRightControls';
import SearchBox from './SearchBox';
import PromptCard from './PromptCard';
import { globalPromptCards, extendedPromptCards } from '../../data/promptCards';
import PromptGalleryModal from '../modals/PromptGalleryModal';
import CardPromptsModal from '../modals/CardPromptsModal';
import logoImage from '../../assets/images/motherson2.png';

/**
 * Welcome Screen Component
 * Main welcome screen with prompt cards and search interface
 */
function WelcomeScreen({ onSendMessage, onNewChat, backendType, setBackendType }) {
  const [showExtendedCards, setShowExtendedCards] = useState(false);
  const [showPromptGallery, setShowPromptGallery] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const searchBoxRef = useRef(null);

  const handlePromptClick = (prompt) => {
    // Set the prompt text in the search box instead of directly sending
    if (searchBoxRef.current) {
      searchBoxRef.current.setValue(prompt);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="welcome-screen" id="welcome-screen">
      {/* CGMSCL Logo on Left */}
      <div className="top-left-logo">
        <img 
          src={logoImage} 
          alt="CGMSCL Logo" 
          className="header-logo"
          onClick={onNewChat}
          style={{ cursor: 'pointer' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150x60?text=Logo+Error';
          }}
        />
      </div>
      
      {/* Top Right Controls */}
      <TopRightControls 
        onNewChat={onNewChat}
        backendType={backendType}
        setBackendType={setBackendType}
      />

      <div className="welcome-header">
        <h1 className="welcome-title">How can I assist you today?</h1> 
        <p className="welcome-subtitle">
          CGMSCL project focused on medical inventory, procurement, and warehouse management 
          for medicines and medical supplies used in healthcare facility stock operations 
          across Chhattisgarh government medical stores.
        </p>
      </div>

      <SearchBox 
        ref={searchBoxRef}
        onSendMessage={onSendMessage}
        onOpenPromptGallery={() => setShowPromptGallery(true)}
        backendType={backendType}
        setBackendType={setBackendType}
      />

      {/* Scrollable Content Section */}
      <div className="welcome-scrollable-content">
        {/* Main Prompt Cards */}
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

        {/* Extended Prompt Cards */}
        {showExtendedCards && (
          <div className="extended-prompt-cards">
            <div className="extended-cards-grid">
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
        )}

        {/* See More Button */}
        {!showExtendedCards && (
          <div className="see-more-container">
            <button
              className="see-more-btn"
              onClick={() => setShowExtendedCards(true)}
            >
              <span>See More Categories</span>
              <span className="show-more-arrow">▼</span>
            </button>
          </div>
        )}
      </div>

      {/* Prompt Gallery Modal */}
      {showPromptGallery && (
        <PromptGalleryModal
          onClose={() => setShowPromptGallery(false)}
          onPromptSelect={handlePromptClick}
        />
      )}

      {/* Card Prompts Modal */}
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

export default WelcomeScreen;

