import React, { useState, useEffect } from 'react';

/**
 * Analysis Toggle Component
 * Toggles analysis mode on/off
 */
function AnalysisToggle({ location = 'home' }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Load state from sessionStorage
    const enabled = sessionStorage.getItem('analysisModeEnabled') === 'true';
    setIsEnabled(enabled);
  }, []);

  const toggleAnalysisMode = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    sessionStorage.setItem('analysisModeEnabled', newState.toString());
    
    // Dispatch custom event to notify AnalysisDropdown components
    window.dispatchEvent(new CustomEvent('analysisModeChanged', { 
      detail: { enabled: newState } 
    }));
    
    // Update all analysis sections (for backward compatibility)
    const analysisContainers = document.querySelectorAll('.analysis-dropdown');
    analysisContainers.forEach(container => {
      container.style.display = newState ? 'block' : 'none';
    });
  };

  const buttonId = `analysisToggle${location === 'home' ? 'Home' : 'Chat'}`;
  const textId = `analysisToggleText${location === 'home' ? 'Home' : 'Chat'}`;
  const iconId = `analysisToggleIcon${location === 'home' ? 'Home' : 'Chat'}`;

  return (
    <div className="analysis-toggle-dropdown">
      <button
        className={`analysis-toggle-btn ${isEnabled ? 'on' : 'off'}`}
        id={buttonId}
        onClick={toggleAnalysisMode}
        aria-label="Toggle Analysis Mode"
      >
        <span className="toggle-text" id={textId}>
          Analysis: {isEnabled ? 'ON' : 'OFF'}
        </span>
        <span className="toggle-icon" id={iconId}>
          {isEnabled ? '✓' : '✗'}
        </span>
      </button>
    </div>
  );
}

export default AnalysisToggle;

