import React from 'react';
import MessageActions from './MessageActions';
import AnalysisDropdown from '../common/AnalysisDropdown';
import Chart from './Chart';

/**
 * Message Bubble Component
 * Individual message display with actions
 */
function MessageBubble({ message, index, messages = [] }) {
  const isUser = message.role === 'user';

  // Prepare data for chart if visualization exists
  const chartData = message.visualization && message.dataRows ? {
    rows: message.dataRows,
    columns: message.dataColumns || []
  } : null;

  // SQL toggle state
  const [showSQL, setShowSQL] = React.useState(false);

  // Show SQL toggle if sql_query exists and is not empty
  const hasSQL = !isUser && message.sql_query && String(message.sql_query).trim().length > 0;

  // Show any extra fields from OCI response (other than response, sql, data, visualization, etc.)
  const extraFields = !isUser && message && typeof message === 'object'
    ? Object.entries(message)
        .filter(([key, val]) => !['role','text','sql_query','suggestions','dataRows','dataColumns','excel_download','visualization','timestamp','analysis','insights','title','subtitle','recentVendorDistribution','query','sql','data','insightsHeader','success','columns','rows'].includes(key) && val && typeof val === 'string')
    : [];

  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-bubble">
        <div className="message-content">
          {/* SQL Toggle Button and SQL Query */}
          {hasSQL && (
            <div style={{ marginBottom: 8 }}>
              <button className="sql-toggle-btn" onClick={() => setShowSQL(v => !v)}>
                {showSQL ? 'Hide SQL Query' : 'Show SQL Query'}
              </button>
              {showSQL && (
                <pre className="sql-query-block">{message.sql_query}</pre>
              )}
            </div>
          )}

          {/* Analysis Dropdown for copy/download, if needed */}
          {hasSQL && <AnalysisDropdown sqlQuery={message.sql_query} />}

          {/* Main message text/markdown */}
          <div className="message-text">
            {message.text}
          </div>

          {/* Show any extra fields from OCI response */}
          {extraFields.length > 0 && (
            <div className="oci-extra-fields">
              {extraFields.map(([key, val]) => (
                <div key={key} style={{ marginTop: 6, color: '#666', fontSize: '0.95em' }}>
                  <b>{key}:</b> {val}
                </div>
              ))}
            </div>
          )}

          {/* Chart - shown when visualization config exists */}
          {!isUser && message.visualization && chartData && (
            <Chart visualization={message.visualization} data={chartData} />
          )}
        </div>
        {!isUser && (
          <MessageActions message={message} index={index} messages={messages} />
        )}
      </div>
    </div>
  );
}

export default MessageBubble;

