import React from 'react';

/**
 * Version Disclaimer Component
 * Shows version info at bottom left
 */
function VersionDisclaimer() {
  return (
    <div 
      className="ai-disclaimer" 
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '12px',
        zIndex: 9999,
        background: '#fffbe7',
        border: '1px solid #ffe08a',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        fontSize: '13px',
        color: '#b48a00',
        fontWeight: 500,
        opacity: 0.96,
        display: 'inline-block'
      }}
    >
      v 1.0.8 [17 NOV 25']
    </div>
  );
}

export default VersionDisclaimer;

