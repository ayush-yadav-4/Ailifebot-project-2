import React, { useState } from 'react';
import { showNotification } from '../../utils/notifications';
import { generateExcelFromData, generateExcelFromResponse } from '../../utils/excelGenerator';
// import { trackDownload } from '../../utils/feedbackService';
// import FeedbackModal from '../modals/FeedbackModal';
import excelIcon from '../../assets/images/excel.png';

/**
 * Message Actions Component
 * Actions for each message (copy, excel, feedback, etc.)
 */
function MessageActions({ message, index, messages = [] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  // const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  // const [selectedRating, setSelectedRating] = useState(null);
  // const [activeFeedback, setActiveFeedback] = useState(null);

  /**
   * Get the query from the previous user message
   * Currently unused - kept for potential future use with feedback modal
   */
  // const getQuery = () => {
  //   // Find the previous user message in the messages array
  //   for (let i = index - 1; i >= 0; i--) {
  //     if (messages[i] && messages[i].role === 'user') {
  //       return messages[i].text;
  //     }
  //   }
  //   return 'Unknown query';
  // };

  /**
   * Handle copy to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      showNotification('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  /**
   * Handle Excel download
   */
  const handleExcelDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      showNotification('Generating Excel file...', 'info');
      
      // Priority 1: Use excel_file_id if available (from backend that supports it)
      if (message.excel_file_id) {
        const apiBase = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/+$/, '');
        const downloadUrl = `${apiBase}/download-excel/${message.excel_file_id}`;
        const response = await fetch(downloadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download Excel file: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CGMSCL_Query_Results_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Track download for feedback
        // trackDownload('excel');
        showNotification('Excel file downloaded successfully!', 'success');
      }
      // Priority 2: Generate Excel from data rows (from current API)
      else if (message.dataRows && Array.isArray(message.dataRows) && message.dataRows.length > 0) {
        const filename = `CGMSCL_Query_Results_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
        // Pass columns if available
        await generateExcelFromData(message.dataRows, filename, message.dataColumns);
        // trackDownload('excel');
        showNotification('Excel file downloaded successfully!', 'success');
      }
      // Priority 3: Generate Excel from suggestions (alternative data format)
      else if (message.suggestions && Array.isArray(message.suggestions) && message.suggestions.length > 0) {
        const filename = `CGMSCL_Query_Results_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
        await generateExcelFromData(message.suggestions, filename);
        // trackDownload('excel');
        showNotification('Excel file downloaded successfully!', 'success');
      }
      // Priority 4: Generate Excel from response text (extract tables if present)
      else if (message.text) {
        const filename = `CGMSCL_Query_Results_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
        await generateExcelFromResponse(message.text, filename);
        // trackDownload('excel');
        showNotification('Excel file downloaded successfully!', 'success');
      }
      else {
        throw new Error('No data available to export');
      }
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      showNotification('Failed to download Excel file. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Handle feedback button click
   */
  // const handleFeedback = (rating) => {
  //   setSelectedRating(rating);
  //   setActiveFeedback(rating);
  //   setShowFeedbackModal(true);
  // };

  /**
   * Handle feedback modal close
  //  * @param {string|null} submittedRating - The rating that was submitted, or null if cancelled
  //  */
  // const handleCloseFeedbackModal = (submittedRating) => {
  //   setShowFeedbackModal(false);
  //   // If feedback was submitted, keep the active state; otherwise reset it
  //   if (submittedRating) {
  //     setActiveFeedback(submittedRating);
  //   } else {
  //     // Only reset if no feedback was previously submitted
  //     // This allows users to change their feedback
  //     if (!activeFeedback) {
  //       setActiveFeedback(null);
  //     }
  //   }
  // };

  return (
    <>
      <div className="message-actions">
        <button 
          className="action-btn copy-btn"
          onClick={handleCopy}
          title="Copy message"
          aria-label="Copy message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        {(message.excel_download || message.excel_file_id || message.dataRows || message.suggestions) && (
          <button
            className="action-btn excel-download-btn"
            onClick={handleExcelDownload}
            title="Download Excel file"
            aria-label="Download Excel file"
            disabled={isDownloading}
          >
            <img src={excelIcon} alt="Download Excel" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </button>
        )}
        {/* Feedback buttons */}
        {/* <button
          className={`action-btn thumbs-up-btn ${activeFeedback === 'Thumbs Up' ? 'active' : ''}`}
          onClick={() => handleFeedback('Thumbs Up')}
          title="Thumbs up"
          aria-label="Thumbs up"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V10M7 10V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M7 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3"></path>
            <path d="M17 9V7a2 2 0 0 0-2-2h-2"></path>
            <path d="M17 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
          </svg>
        </button> */}
        {/* <button
          className={`action-btn thumbs-down-btn ${activeFeedback === 'Thumbs Down' ? 'active' : ''}`}
          onClick={() => handleFeedback('Thumbs Down')}
          title="Thumbs down"
          aria-label="Thumbs down"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v12M17 14v2a2 2 0 0 1-2 2h-2M17 14h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"></path>
            <path d="M7 15V7a2 2 0 0 1 2-2h2"></path>
            <path d="M7 15h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2"></path>
          </svg>
        </button> */}
      </div>
      
      {/* Feedback Modal */}
      {/* {showFeedbackModal && (
        <FeedbackModal
          query={getQuery()}
          response={message.text}
          rating={selectedRating}
          sqlQuery={message.sql_query || null}
          onClose={handleCloseFeedbackModal}
        />
      )} */}
    </>
  );
}

export default MessageActions;

