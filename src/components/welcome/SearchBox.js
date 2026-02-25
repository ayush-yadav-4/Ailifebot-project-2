import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { suggestionPills } from '../../data/promptCards';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

/**
 * Search Box Component
 * Microsoft Copilot-style search interface
 */
const SearchBox = forwardRef(function SearchBox({ onSendMessage, onOpenPromptGallery, backendType, setBackendType }, ref) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const inputValueRef = useRef('');
  const baseInputRef = useRef('');
  const { isListening, transcript, isSupported, toggleRecording, stopRecording } = useSpeechRecognition('auto');

  // Expose method to set input value from parent component
  useImperativeHandle(ref, () => ({
    setValue: (value) => {
      setInputValue(value);
      inputRef.current?.focus();
    }
  }));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputValueRef.current = '';
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputValueRef.current = suggestion;
    inputRef.current?.focus();
  };

  // Keep inputValueRef in sync with inputValue
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  // Handle recording start - save current input as base
  const prevIsListeningRef = useRef(false);
  useEffect(() => {
    // Only capture base when transitioning from not listening to listening
    if (isListening && !prevIsListeningRef.current) {
      // Use the ref to get the most current value
      baseInputRef.current = inputValueRef.current;
      console.log('Recording started, base input:', baseInputRef.current);
    }
    prevIsListeningRef.current = isListening;
  }, [isListening]); // Only depend on isListening, use ref for current value

  // Update input value when speech transcript changes (only if recording)
  useEffect(() => {
    if (isListening) {
      // Always update when recording, even if transcript is empty (to show interim results)
      const newValue = baseInputRef.current + transcript;
      console.log('Transcript update:', { 
        transcript, 
        transcriptLength: transcript.length,
        baseInput: baseInputRef.current, 
        newValue,
        isListening 
      });
      setInputValue(newValue);
    }
  }, [transcript, isListening]);

  // Stop recording only when component unmounts (not on every isListening change)
  useEffect(() => {
    return () => {
      // Only stop if component is actually unmounting and we're still listening
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run cleanup on unmount

  return (
    <div className="copilot-search-container">
      {/* Floating suggestions */}
      <div className="floating-suggestions">
        {suggestionPills.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-pill"
            onClick={() => handleSuggestionClick(suggestion)}
            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
          >
            {suggestion}
          </button>
        ))}
        <button
          className="prompt-gallery-btn"
          onClick={onOpenPromptGallery}
          title="Prompt Gallery"
          style={{ animationDelay: '0.4s' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Search input area */}
      <div className="copilot-search-box">
        <input
          type="text"
          id="copilot-search-input"
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here..."
        />
        {isSupported && (
          <button
            className={`voice-btn ${isListening ? 'recording' : ''}`}
            onClick={toggleRecording}
            title={isListening ? 'Stop recording' : 'Start voice input'}
            type="button"
            aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
          >
            {isListening ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
        <button
          className="send-btn"
          id="copilot-send-btn"
          onClick={handleSend}
          title="Send message"
          disabled={!inputValue.trim()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
          
        {/* Backend Toggle */}
        <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '16px', overflow: 'hidden', height: '32px' }}>
            <button 
                type="button"
                onClick={() => setBackendType && setBackendType('AWS')}
                title="Use AWS Backend"
                style={{ 
                    padding: '0 12px', 
                    height: '100%',
                    background: backendType === 'AWS' ? '#1F7246' : '#f5f5f5', 
                    color: backendType === 'AWS' ? '#fff' : '#666',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                }}>AWS</button>
            <button 
                type="button"
                onClick={() => setBackendType && setBackendType('OCI')}
                title="Use OCI Backend"
                style={{ 
                    padding: '0 12px', 
                    height: '100%',
                    background: backendType === 'OCI' ? '#1F7246' : '#f5f5f5', 
                    color: backendType === 'OCI' ? '#fff' : '#666',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    borderLeft: '1px solid #e0e0e0'
                }}>OCI</button>
        </div>
      </div>
    </div>
  );
});

export default SearchBox;

