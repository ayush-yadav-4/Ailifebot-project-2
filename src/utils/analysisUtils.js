/**
 * Analysis Utilities
 * Functions for managing analysis data
 */

/**
 * Store analysis data
 */
export function storeAnalysisData(query, sqlQuery = null) {
  const analysisData = JSON.parse(sessionStorage.getItem('analysisData') || '[]');
  
  analysisData.push({
    query: query,
    sql_query: sqlQuery,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 20 queries
  if (analysisData.length > 20) {
    analysisData.splice(0, analysisData.length - 20);
  }
  
  sessionStorage.setItem('analysisData', JSON.stringify(analysisData));
}

/**
 * Get analysis data
 */
export function getAnalysisData() {
  return JSON.parse(sessionStorage.getItem('analysisData') || '[]');
}

/**
 * Format timestamp for display
 */
export function formatTimestampForDisplay(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

