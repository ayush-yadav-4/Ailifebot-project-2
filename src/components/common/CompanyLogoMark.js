import React from 'react';
import companyLogo from '../../assets/images/company_logo-01.jpg';

/**
 * Company Logo Mark Component
 * Displays company logo as a watermark/mark in bottom-right corner
 * Similar to how most companies add their logo mark
 */
function CompanyLogoMark() {
  return (
    <a 
      href="https://www.ailifebot.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="company-logo-mark"
    >
      <span className="powered-by-text">Powered by</span>
      <img 
        src={companyLogo} 
        alt="AI Lifebot" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
        }}
      />
    </a>
  );
}

export default CompanyLogoMark;
