import React, { useState, useEffect, useRef } from 'react';

/**
 * Analysis Dropdown Component
 * Shows SQL query in a dropdown when analysis toggle is enabled
 * Based on reference from igl.html
 */
function AnalysisDropdown({ sqlQuery }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalysisEnabled, setIsAnalysisEnabled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if analysis mode is enabled
    const checkAnalysisMode = () => {
      const enabled = sessionStorage.getItem('analysisModeEnabled') === 'true';
      setIsAnalysisEnabled(enabled);
      // Close dropdown if analysis is disabled
      if (!enabled) {
        setIsOpen(false);
      }
    };

    // Check on mount
    checkAnalysisMode();

    // Listen for changes in sessionStorage
    const handleStorageChange = () => {
      checkAnalysisMode();
    };

    // Listen for custom event from AnalysisToggle
    window.addEventListener('analysisModeChanged', handleStorageChange);
    
    // Also check periodically for same-tab updates
    const interval = setInterval(checkAnalysisMode, 100);

    return () => {
      window.removeEventListener('analysisModeChanged', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render anything if analysis is disabled or no SQL query
  if (!isAnalysisEnabled || !sqlQuery || !sqlQuery.trim()) {
    return null;
  }

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Format SQL query with proper indentation
  const formatSQLQuery = (query) => {
    if (!query || query.trim() === '') {
      return '';
    }
    // Basic formatting - preserve original formatting
    return query.trim();
  };

  const formattedQuery = formatSQLQuery(sqlQuery);

  return (
    <div className="analysis-dropdown" ref={dropdownRef}>
      <button 
        className="analysis-dropdown-btn" 
        onClick={toggleDropdown}
        aria-label="Toggle Analysis Dropdown"
      >
        Analysis
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      {isOpen && (
        <div className="analysis-dropdown-content show">
          <div className="analysis-dropdown-header">
            📊 SQL Query Used
          </div>
          <div className="analysis-dropdown-body">
            <pre className="sql-query-code">{formattedQuery}</pre>
          </div>
          <div className="analysis-dropdown-footer">
            This query was executed to fetch the data displayed below
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisDropdown;

