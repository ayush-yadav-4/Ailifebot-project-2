import React, { useState } from 'react';
import { showNotification } from '../../utils/notifications';
import { generateExcelFromData, generateExcelFromResponse } from '../../utils/excelGenerator';
// import { trackDownload } from '../../utils/feedbackService';
// import FeedbackModal from '../modals/FeedbackModal';
import excelIcon from '../../assets/images/excel.png';
import Chart from './Chart';

/**
 * Message Actions Component
 * Actions for each message (copy, excel, feedback, etc.)
 */
function MessageActions({ message, index, messages = [] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [detailedSummary, setDetailedSummary] = useState('');
  const [summaryMode, setSummaryMode] = useState('eco'); // 'eco' or 'standard'
  const [lastSummaryModeUsed, setLastSummaryModeUsed] = useState(null); // freezes mode label/output until next fetch
  const [summaryTableRows, setSummaryTableRows] = useState(null);
  const [summaryTableColumns, setSummaryTableColumns] = useState(null);
  const [summaryVisualization, setSummaryVisualization] = useState(null);
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

  /**
   * Handle "Get Detailed Summary" click
   * Uses cache_id from the message to call the summary endpoint.
   * User can request summaries multiple times and switch modes freely.
   */
  const handleDetailedSummary = async () => {
    if (!message.cache_id) {
      showNotification('Detailed summary is not available for this response.', 'error');
      return;
    }

    // Block only while a request is in-flight
    if (isFetchingSummary) {
      return;
    }

    setIsFetchingSummary(true);
    try {
      // Determine which endpoint to use based on backend type (OCI or AWS)
      const messageBackendType = message.backendType || 'AWS'; // Default to AWS if not set
      
      let SUMMARY_API_URL;
      if (messageBackendType === 'OCI') {
        // OCI analysis endpoint
        SUMMARY_API_URL = 'https://kkthcckqby2ta244ytlu4r25xi.apigateway.ap-hyderabad-1.oci.customer-oci.com/api/analysis';
      } else {
        // AWS analysis endpoint
        SUMMARY_API_URL = 'https://ytfvdexbhj.execute-api.ap-south-1.amazonaws.com/prod/query';
      }

      // Map UI mode to backend mode value
      // For OCI: use 'eco' or 'standard' directly
      // For AWS: use 'eco' or 'detailed' (backend accepts 'standard' as alias for 'detailed')
      const backendMode = messageBackendType === 'OCI' 
        ? (summaryMode === 'eco' ? 'eco' : 'standard')
        : (summaryMode === 'eco' ? 'eco' : 'detailed');

      console.log(`Fetching ${summaryMode} summary from ${messageBackendType} backend: ${SUMMARY_API_URL}`);

      const response = await fetch(SUMMARY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Send cache_id and selected mode as expected by backend
        body: JSON.stringify({ cache_id: message.cache_id, mode: backendMode })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Summary API error ${response.status}${errorText ? `: ${errorText}` : ''}`);
      }

      const result = await response.json();

      // Try to extract a meaningful summary from the response
      let summaryText = '';
      if (result.data && typeof result.data.analysis === 'string') {
        summaryText = result.data.analysis;
      } else if (typeof result.analysis === 'string') {
        summaryText = result.analysis;
      } else if (typeof result.response === 'string') {
        summaryText = result.response;
      }

      setDetailedSummary(summaryText);
      setLastSummaryModeUsed(summaryMode);

      // Capture suggested visualization, if provided by backend
      if (result.visualization && typeof result.visualization === 'object') {
        setSummaryVisualization(result.visualization);
      } else {
        setSummaryVisualization(null);
      }

      // For eco mode: keep output lightweight (text-only, no table)
      // For standard mode: render full tabular view if present
      if (summaryMode === 'standard') {
        if (Array.isArray(result.data) && result.data.length > 0) {
          setSummaryTableRows(result.data);

          if (Array.isArray(result.columns) && result.columns.length > 0) {
            setSummaryTableColumns(result.columns);
          } else if (typeof result.data[0] === 'object' && result.data[0] !== null) {
            setSummaryTableColumns(Object.keys(result.data[0]));
          }
        } else if (Array.isArray(result.rows) && result.rows.length > 0) {
          // Fallback to rows/columns format if present
          setSummaryTableRows(result.rows);
          if (Array.isArray(result.columns)) {
            setSummaryTableColumns(result.columns);
          }
        } else {
          setSummaryTableRows(null);
          setSummaryTableColumns(null);
        }
      } else {
        // Eco mode: no heavy table rendering
        setSummaryTableRows(null);
        setSummaryTableColumns(null);
      }
      showNotification('Detailed summary loaded.', 'success');
    } catch (error) {
      console.error('Error fetching detailed summary:', error);
      showNotification('Failed to fetch detailed summary. Please try again.', 'error');
    } finally {
      setIsFetchingSummary(false);
    }
  };

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

      {/* Big Detailed Summary controls at bottom-left of the message */}
      {message.cache_id && (
        <div
          className="summary-button-container"
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          {/* Mode selector: Eco vs Standard */}
          <div
            className="summary-mode-toggle"
            style={{
              display: 'inline-flex',
              borderRadius: 999,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              background: '#f9f9f9'
            }}
          >
            <button
              type="button"
              onClick={() => !isFetchingSummary && setSummaryMode('eco')}
              style={{
                padding: '6px 12px',
                border: 'none',
                cursor: isFetchingSummary ? 'not-allowed' : 'pointer',
                background: summaryMode === 'eco' ? '#1F7246' : 'transparent',
                color: summaryMode === 'eco' ? '#fff' : '#555',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              Eco
            </button>
            <button
              type="button"
              onClick={() => !isFetchingSummary && setSummaryMode('standard')}
              style={{
                padding: '6px 12px',
                border: 'none',
                cursor: isFetchingSummary ? 'not-allowed' : 'pointer',
                background: summaryMode === 'standard' ? '#1F7246' : 'transparent',
                color: summaryMode === 'standard' ? '#fff' : '#555',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderLeft: '1px solid #e0e0e0'
              }}
            >
              Standard
            </button>
          </div>

          {/* Main summary trigger button */}
          <button
            className="summary-btn-primary"
            onClick={handleDetailedSummary}
            aria-label="Get detailed summary"
            disabled={isFetchingSummary}
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              border: 'none',
              cursor: isFetchingSummary ? 'not-allowed' : 'pointer',
              background: '#1F7246',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              opacity: isFetchingSummary ? 0.7 : 1
            }}
            >
            <span>
              {isFetchingSummary
                ? `Loading ${summaryMode} summary...`
                : `Get ${summaryMode === 'eco' ? 'Eco' : 'Standard'} Summary`}
            </span>
          </button>
        </div>
      )}

      {/* Detailed summary content - rendered in the same message container */}
      {(detailedSummary || (summaryTableRows && summaryTableColumns)) && (
        <div className="detailed-summary-block" style={{ marginTop: 12, padding: '10px 0', borderTop: '1px dashed #ddd' }}>
          {detailedSummary && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {lastSummaryModeUsed === 'standard' ? 'Detailed Analysis (Standard Mode)' : 'Summary (Eco Mode)'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95em', color: '#333' }}>
                {detailedSummary}
              </div>
            </div>
          )}

          {summaryTableRows && summaryTableColumns && (
            <div
              className="summary-table-wrapper"
              style={{
                marginTop: 4,
                maxHeight: 320,
                overflow: 'auto',
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                background: '#fafafa'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem'
                }}
              >
                <thead>
                  <tr>
                    {summaryTableColumns.map((col) => (
                      <th
                        key={col}
                        style={{
                          position: 'sticky',
                          top: 0,
                          background: '#f1f5f9',
                          padding: '6px 8px',
                          textAlign: 'left',
                          borderBottom: '1px solid #e0e0e0',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summaryTableRows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      {Array.isArray(row)
                        ? summaryTableColumns.map((_, colIdx) => (
                            <td
                              key={colIdx}
                              style={{
                                padding: '6px 8px',
                                borderBottom: '1px solid #f1f5f9',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {row[colIdx]}
                            </td>
                          ))
                        : summaryTableColumns.map((col) => (
                            <td
                              key={col}
                              style={{
                                padding: '6px 8px',
                                borderBottom: '1px solid #f1f5f9',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {row[col]}
                            </td>
                          ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Render chart for standard mode if backend provides visualization + tabular data.
              Uses lastSummaryModeUsed so toggling the mode does not mutate an existing output. */}
          {lastSummaryModeUsed === 'standard' && summaryVisualization && summaryTableRows && summaryTableColumns && (
            <div style={{ marginTop: 10 }}>
              <Chart
                visualization={summaryVisualization}
                data={{ rows: summaryTableRows, columns: summaryTableColumns }}
              />
            </div>
          )}
        </div>
      )}

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

