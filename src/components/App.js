import React, { useState, useEffect } from 'react';
import LoadingScreen from './common/LoadingScreen';
import WelcomeScreen from './welcome/WelcomeScreen';
import ChatArea from './chat/ChatArea';
import AnalysisPanel from './common/AnalysisPanel';
import VersionDisclaimer from './common/VersionDisclaimer';
import CompanyLogoMark from './common/CompanyLogoMark';
import { normalizeOCIResponse, normalizeAWSResponse, extractData } from '../utils/responseNormalizer';
// import { startResponseTimer } from '../utils/feedbackService';

/**
 * Main App Component
 * Manages application state and layout
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [backendType, setBackendType] = useState('AWS'); // 'AWS' or 'OCI'

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
        // If there's history, show chat view
        if (parsed.length > 0) {
          setShowWelcome(false);
          setShowChat(true);
        }
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Hide loading screen after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);


  // Handle starting a new chat
  const handleNewChat = () => {
    setShowWelcome(true);
    setShowChat(false);
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  // Handle sending a message (switches to chat view)
  const handleSendMessage = async (message) => {
    if (!message || !message.trim()) return;

    setShowWelcome(false);
    setShowChat(true);
    setIsSending(true);

    const trimmed = message.trim();

    // Add user message to history immediately
    const userMessage = {
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, userMessage]);

    // Start response timer for enhanced feedback tracking
    // startResponseTimer();

    // Call backend Lambda for assistant response
    try {
      let data;
      if (backendType === 'OCI') {
        // Directly call OCI API Gateway endpoint
        const OCI_API_URL = "https://kkthcckqby2ta244ytlu4r25xi.apigateway.ap-hyderabad-1.oci.customer-oci.com/api/test";
        console.log(`Sending request to OCI API Gateway: ${OCI_API_URL}`);
        const response = await fetch(OCI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OCI API error ${response.status}: ${errText}`);
        }
        data = await response.json();
        console.log('Raw OCI API Response:', data);

        // Use normalizer utility for OCI response
        data = normalizeOCIResponse(data);
      } else {
        // Directly call AWS API Gateway endpoint for answering user questions
        const AWS_API_URL = "https://qgpel27gok.execute-api.ap-south-1.amazonaws.com/dev/master";
        console.log(`Sending request to AWS API Gateway: ${AWS_API_URL}`);
        const response = await fetch(AWS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: trimmed
          })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API error ${response.status}: ${errText}`);
        }
        data = await response.json();
        console.log('Raw AWS API Response:', data);

        // Use normalizer utility for AWS response
        data = normalizeAWSResponse(data);
      }

      // Extract rows and columns using utility
      const { rows: possibleRows, columns: possibleColumns } = extractData(data);

      console.log('Final data extraction:', {
        hasRows: !!possibleRows,
        rowsLength: possibleRows?.length || 0,
        hasColumns: !!possibleColumns,
        columnsLength: possibleColumns?.length || 0,
        sqlQuery: data.sql_query
      });

      let visualizationDataRows = null;
      let visualizationDataColumns = null;
      if (data.visualization?.data) {
        if (Array.isArray(data.visualization.data)) {
          visualizationDataRows = data.visualization.data;
        } else if (data.visualization.data.rows) {
          visualizationDataRows = data.visualization.data.rows;
          visualizationDataColumns = data.visualization.data.columns;
        }
      }

      const finalDataRows = possibleRows || visualizationDataRows || null;
      const finalDataColumns = possibleColumns || visualizationDataColumns || null;
      
      const hasTabularData =
        finalDataRows &&
        Array.isArray(finalDataRows) &&
        finalDataRows.length > 0 &&
        finalDataColumns &&
        Array.isArray(finalDataColumns) &&
        finalDataColumns.length > 0;

      const assistantMessage = {
        role: 'assistant',
        text: hasTabularData
            ? (
              // Render a markdown-based report for the data whenever we have tabular rows/columns
                (data.analysis ? `${data.analysis}\n\n` : '') +
                (data.title ? `### ${data.title}\n\n` : '') +
                (data.subtitle ? `#### ${data.subtitle}\n\n` : '') +
                '| ' + finalDataColumns.join(' | ') + ' |\n' +
                '| ' + finalDataColumns.map(() => '---').join(' | ') + ' |\n' +
              finalDataRows
                .map(row =>
                  '| ' +
                  (Array.isArray(row) ? row.join(' | ') : Object.values(row).join(' | ')) +
                  ' |'
                )
                .join('\n') +
              (data.insights
                ? `\n\n### ${data.insightsHeader || 'Key Insights'}\n${
                    Array.isArray(data.insights)
                      ? data.insights.map(i => '- ' + i).join('\n')
                      : data.insights
                  }`
                : '') +
              (data.recentVendorDistribution
                ? `\n\n### Recent Vendor Distribution\n${
                    Array.isArray(data.recentVendorDistribution)
                      ? data.recentVendorDistribution.map(v => '- ' + v).join('\n')
                      : data.recentVendorDistribution
                  }`
                : '')
              )
            : (data.response || 'No response received.'),
        sql_query: data.sql_query || data.sql || null,
        cache_id: data.cache_id || null,
        suggestions: finalDataRows || null,
        dataRows: finalDataRows,
        dataColumns: finalDataColumns,
        excel_download: !!(finalDataRows && Array.isArray(finalDataRows) && finalDataRows.length > 0),
        visualization: data.visualization || null,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        sql_query: null,
        suggestions: null,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
    setIsSending(false);
  };

  // Handle receiving a response
  const handleReceiveResponse = (response, sqlQuery = null, suggestions = null) => {
    const assistantMessage = {
      role: 'assistant',
      text: response,
      sql_query: sqlQuery,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, assistantMessage]);
    return assistantMessage;
  };

  return (
    <div className="copilot-layout" id="chatContainer">
      {isLoading && <LoadingScreen />}
      
      <div className="main-content" id="main-content">
        <AnalysisPanel />
        
        {showWelcome && (
          <WelcomeScreen 
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            backendType={backendType}
            setBackendType={setBackendType}
          />
        )}
        
        {showChat && (
          <ChatArea
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onReceiveResponse={handleReceiveResponse}
            onNewChat={handleNewChat}
            isSending={isSending}
            backendType={backendType}
            setBackendType={setBackendType}
          />
        )}
      </div>
      
      <VersionDisclaimer />
      <CompanyLogoMark />
    </div>
  );
}

export default App;
