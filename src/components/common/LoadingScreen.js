import React, { useEffect, useState } from 'react';

/**
 * LoadingScreen Component
 * Displays loading spinner while app initializes
 */
function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`loading-screen ${!isVisible ? 'fade-out' : ''}`} id="loadingScreen">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading CGMSCL Dashboard...</div>
    </div>
  );
}

export default LoadingScreen;

