import React, { useState, useEffect } from 'react';

/**
 * Analysis Panel Component
 * Side panel showing query analysis and statistics
 */
function AnalysisPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState([]);

  useEffect(() => {
    // Load analysis data from sessionStorage
    const data = JSON.parse(sessionStorage.getItem('analysisData') || '[]');
    setAnalysisData(data);
    
    // Listen for analysis data updates
    const handleStorageChange = () => {
      const updated = JSON.parse(sessionStorage.getItem('analysisData') || '[]');
      setAnalysisData(updated);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (for same-tab updates)
    const interval = setInterval(() => {
      const updated = JSON.parse(sessionStorage.getItem('analysisData') || '[]');
      if (updated.length !== analysisData.length) {
        setAnalysisData(updated);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [analysisData.length]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const totalQueries = analysisData.length;
  const sqlQueries = analysisData.filter(item => item.sql_query).length;

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="analysis-panel" id="analysisPanel">
      <div className="analysis-panel-header">
        <h3>Analysis Panel</h3>
        <button 
          className="analysis-panel-close" 
          onClick={togglePanel}
          aria-label="Close Analysis Panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="analysis-panel-content">
        <div className="analysis-section">
          <h4>Recent Queries</h4>
          <div className="analysis-query-list" id="analysisQueryList">
            {analysisData.length === 0 ? (
              <p className="analysis-empty-state">
                No analysis queries yet. Start a conversation to see analysis data here.
              </p>
            ) : (
              analysisData.slice(-5).reverse().map((item, index) => (
                <div 
                  key={index}
                  className="analysis-query-item"
                  style={{
                    padding: '8px 12px',
                    marginBottom: '8px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    borderLeft: '3px solid #1F7246'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span>{item.sql_query ? '📊' : '💬'}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>
                    {item.query.substring(0, 100)}{item.query.length > 100 ? '...' : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="analysis-section">
          <h4>Query Statistics</h4>
          <div className="analysis-stats" id="analysisStats">
            <div className="stat-item">
              <span className="stat-label">Total Queries:</span>
              <span className="stat-value" id="totalQueries">{totalQueries}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">SQL Queries:</span>
              <span className="stat-value" id="sqlQueries">{sqlQueries}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPanel;

