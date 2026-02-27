/**
 * Response Normalizer Utility
 * Handles transformation of various API response formats (AWS, OCI) 
 * into a consistent internal format for the UI.
 */

/**
 * Normalizes AWS API responses
 * @param {Object} data - Raw response data from AWS API
 * @returns {Object} Normalized data object
 */
export function normalizeAWSResponse(data) {
  if (!data || typeof data !== 'object') return data;

  let normalized = { ...data };

  // Map sql -> sql_query
  if (normalized.sql && !normalized.sql_query) {
    normalized.sql_query = normalized.sql;
  }
  
  // Map query -> title if title is missing
  if (normalized.query && !normalized.title) {
    normalized.title = normalized.query;
  }
  
  // Extract data structure from AWS response format: data.result.{columns, rows}
  if (normalized.data?.result) {
    normalized.rows = normalized.data.result.rows;
    normalized.columns = normalized.data.result.columns;
    normalized.success = normalized.data.success;
    normalized.row_count = normalized.data.result.row_count;
  }

  // Set response message if available
  if (normalized.message && !normalized.response) {
    normalized.response = normalized.message;
  } else if (!normalized.response && (normalized.success === true || normalized.data?.success === true)) {
    normalized.response = 'Query executed successfully.';
  }

  // Auto-generate visualization if missing
  if (!normalized.visualization) {
    const rows = normalized.rows || normalized.data?.result?.rows;
    const columns = normalized.columns || normalized.data?.result?.columns;
    
    if (Array.isArray(rows) && rows.length > 0 && Array.isArray(columns) && columns.length > 0) {
      // Ensure first column exists and is valid
      const firstColumn = columns[0];
      if (firstColumn && firstColumn.trim() !== '') {
        // Find numeric column for Y axis (skip first column usually labels)
        let numericColIndex = -1;
        for (let i = 1; i < columns.length; i++) {
          const sampleVal = Array.isArray(rows[0]) ? rows[0][i] : rows[0][columns[i]];
          if (typeof sampleVal === 'number' || (typeof sampleVal === 'string' && !isNaN(parseFloat(sampleVal)))) {
            numericColIndex = i;
            break;
          }
        }

        if (numericColIndex !== -1 && columns[numericColIndex]) {
          normalized.visualization = {
            chartType: 'bar',
            xAxis: firstColumn,
            yAxis: columns[numericColIndex],
            title: normalized.title || 'Data Visualization'
          };
        }
      }
    }
  }
  
  // Map other rich fields with fallbacks
  normalized.analysis = normalized.analysis || normalized.data?.analysis || null;
  
  // Generate a basic analysis if missing but we have rows and a query
  if (!normalized.analysis && normalized.rows && normalized.rows.length > 0 && normalized.query) {
    normalized.analysis = `Based on your request regarding "${normalized.query}", I have retrieved the following ${normalized.rows.length} ${normalized.rows.length === 1 ? 'result' : 'results'}.`;
  } else if (!normalized.analysis && normalized.rows && normalized.rows.length > 0) {
    normalized.analysis = `I found ${normalized.rows.length} ${normalized.rows.length === 1 ? 'record' : 'records'} matching your query.`;
  }

  normalized.insights = normalized.insights || normalized.KeyInformation || normalized.key_information || normalized.data?.insights || null;
  normalized.insightsHeader = normalized.insightsHeader || ((normalized.KeyInformation || normalized.key_information) ? 'Key Information' : 'Key Insights');
  normalized.title = normalized.title || normalized.header || normalized.data?.title || null;
  normalized.subtitle = normalized.subtitle || normalized.subheader || normalized.data?.subtitle || null;

  // Final normalization of sql_query
  normalized.sql_query = normalized.sql_query || normalized.sql || (normalized.data && (normalized.data.sql || normalized.data.sql_query)) || null;

  return normalized;
}

/**
 * Normalizes OCI API responses
 * @param {Object} data - Raw response data from OCI API
 * @returns {Object} Normalized data object
 */
export function normalizeOCIResponse(data) {
  if (!data || typeof data !== 'object') return data;

  let normalized = { ...data };

  // 1. Handle stringified JSON results in 'response' field
  if (typeof normalized.response === 'string' && normalized.response.includes('Results:')) {
    const resultsIndex = normalized.response.indexOf('Results:');
    const preResultsText = normalized.response.substring(0, resultsIndex)
      .replace(/Query executed successfully\.?\s*/i, '')
      .trim();
    
    const match = normalized.response.match(/Results:\s*(\{.*\}|\[.*\])/s);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        
        // Merge parsed fields
        normalized = {
          ...normalized,
          ...parsed,
          // Re-nest data if it came from parsed result
          data: parsed.result ? { columns: parsed.result.columns, rows: parsed.result.rows } : (parsed.data || (Array.isArray(parsed) ? { rows: parsed } : parsed)),
          analysis: parsed.analysis || (preResultsText.length > 0 ? preResultsText : null) || normalized.analysis || null
        };
      } catch (e) {
        console.error('Failed to parse OCI Results JSON from string:', e);
      }
    }
  }

  // 2. Map standard OCI fields to expected internal format
  // Map sql -> sql_query
  if (normalized.sql && !normalized.sql_query) {
    normalized.sql_query = normalized.sql;
  }
  
  // Map query -> title if title is missing
  if (normalized.query && !normalized.title) {
    normalized.title = normalized.query;
  }
  
  // Ensure data structure is accessible at top level for extractRowsAndColumns
  if (normalized.data?.result) {
    normalized.rows = normalized.data.result.rows;
    normalized.columns = normalized.data.result.columns;
    normalized.success = normalized.data.success;
  }

  // Fallback for success message
  if (!normalized.response && (normalized.success === true || normalized.data?.success === true)) {
    normalized.response = 'Query executed successfully.';
  }

  // 3. Auto-generate visualization if missing
  if (!normalized.visualization) {
    const rows = normalized.rows || normalized.data?.rows || normalized.data?.result?.rows;
    const columns = normalized.columns || normalized.data?.columns || normalized.data?.result?.columns;
    
    if (Array.isArray(rows) && rows.length > 0 && Array.isArray(columns) && columns.length > 0) {
      // Ensure first column exists and is valid
      const firstColumn = columns[0];
      if (firstColumn && firstColumn.trim() !== '') {
      // Find numeric column for Y axis (skip first column usually labels)
      let numericColIndex = -1;
      for (let i = 1; i < columns.length; i++) {
        const sampleVal = Array.isArray(rows[0]) ? rows[0][i] : rows[0][columns[i]];
        if (typeof sampleVal === 'number' || (typeof sampleVal === 'string' && !isNaN(parseFloat(sampleVal)))) {
          numericColIndex = i;
          break;
        }
      }

        if (numericColIndex !== -1 && columns[numericColIndex]) {
        normalized.visualization = {
          chartType: 'bar',
            xAxis: firstColumn,
          yAxis: columns[numericColIndex],
          title: normalized.title || 'Data Visualization'
        };
        }
      }
    }
  }
  
  // 4. Map other rich fields with fallbacks
  normalized.analysis = normalized.analysis || normalized.data?.analysis || null;
  
  // Generate a basic analysis if missing but we have rows and a query
  if (!normalized.analysis && normalized.rows && normalized.rows.length > 0 && normalized.query) {
    normalized.analysis = `Based on your request regarding "${normalized.query}", I have retrieved the following ${normalized.rows.length} ${normalized.rows.length === 1 ? 'result' : 'results'}.`;
  } else if (!normalized.analysis && normalized.rows && normalized.rows.length > 0) {
    normalized.analysis = `I found ${normalized.rows.length} ${normalized.rows.length === 1 ? 'record' : 'records'} matching your query.`;
  }

  normalized.insights = normalized.insights || normalized.KeyInformation || normalized.key_information || normalized.data?.insights || null;
  normalized.insightsHeader = normalized.insightsHeader || ((normalized.KeyInformation || normalized.key_information) ? 'Key Information' : 'Key Insights');
  normalized.title = normalized.title || normalized.header || normalized.data?.title || null;
  normalized.subtitle = normalized.subtitle || normalized.subheader || normalized.data?.subtitle || null;

  // Final normalization of sql_query
  normalized.sql_query = normalized.sql_query || normalized.sql || (normalized.data && (normalized.data.sql || normalized.data.sql_query)) || null;

  return normalized;
}

/**
 * Extracts rows and columns from normalized response
 * @param {Object} data - Normalized response data
 * @returns {Object} { rows, columns }
 */
export function extractData(data) {
  if (!data) return { rows: null, columns: null };

  let rows = null;
  if (Array.isArray(data.rows)) {
    rows = data.rows;
  } else if (Array.isArray(data.data?.result?.rows)) {
    rows = data.data.result.rows;
  } else if (Array.isArray(data.data?.rows)) {
    rows = data.data.rows;
  } else if (Array.isArray(data.result?.rows)) {
    rows = data.result.rows;
  } else if (Array.isArray(data.data)) {
    rows = data.data;
  }

  let columns = null;
  if (Array.isArray(data.columns)) {
    columns = data.columns;
  } else if (Array.isArray(data.data?.result?.columns)) {
    columns = data.data.result.columns;
  } else if (Array.isArray(data.data?.columns)) {
    columns = data.data.columns;
  } else if (Array.isArray(data.result?.columns)) {
    columns = data.result.columns;
  } else if (Array.isArray(data.data?.columnNames)) {
    columns = data.data.columnNames;
  }

  // If we have rows but no columns, and rows are objects, extract columns from keys
  if (rows && rows.length > 0 && !columns) {
    if (!Array.isArray(rows[0]) && typeof rows[0] === 'object') {
      columns = Object.keys(rows[0]);
    }
  }

  return { rows, columns };
}

