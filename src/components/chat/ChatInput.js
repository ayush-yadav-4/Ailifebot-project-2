import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

/**
 * Chat Input Component
 * Input area for typing and sending messages
 */
const ChatInput = forwardRef(function ChatInput({ onSend, isSending = false, backendType, setBackendType }, ref) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const inputValueRef = useRef('');
  const baseInputRef = useRef('');
  const { isListening, transcript, isSupported, toggleRecording, stopRecording } = useSpeechRecognition('auto');

  // Allow parent components to prefill text or focus the input from suggestions/gallery
  useImperativeHandle(ref, () => ({
    setValue: (value) => {
      setInputValue(value);
      inputRef.current?.focus();
    },
    focus: () => inputRef.current?.focus(),
  }));

  const handleSend = () => {
    if (isSending) return;

    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue('');
      inputValueRef.current = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="chat-search-container">
      <input
        type="text"
        className="chat-search-input"
        id="user-input"
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        aria-label="Chat message input"
        autoComplete="off"
        spellCheck="true"
      />
      
      {isSupported && (
        <button
          className={`chat-button mic-button ${isListening ? 'recording' : ''}`}
          type="button"
          aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
          title={isListening ? 'Stop recording' : 'Start voice input'}
          onClick={toggleRecording}
          disabled={isSending}
        >
          {isListening ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      )}
      
      <button
        className="chat-button send-button"
        type="button"
        aria-label="Send message"
        title="Send message"
        id="send-button"
        onClick={handleSend}
        disabled={!inputValue.trim() || isSending}
        aria-busy={isSending}
      >
        {isSending ? (
          <div className="loading-spinner button-spinner" role="status" aria-label="Sending" />
        ) : (
          <svg id="send-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="m21.426 11.095-17-8A.999.999 0 0 0 3.03 4.242L4.969 12 3.03 19.758a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81zM5.481 18.197l.839-3.357L12 12 6.32 9.16l-.839-3.357L18.651 12l-13.17 6.197z"/>
          </svg>
        )}
      </button>

      {/* Backend Toggle */}
      <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '16px', overflow: 'hidden', height: '32px', flexShrink: 0 }}>
          <button 
              type="button"
              onClick={() => setBackendType && setBackendType('AWS')}
              title="Use AWS Backend"
              disabled={isSending}
              style={{ 
                  padding: '0 12px', 
                  height: '100%',
                  background: backendType === 'AWS' ? '#1F7246' : '#fff', 
                  color: backendType === 'AWS' ? '#fff' : '#666',
                  border: 'none',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: isSending ? 0.7 : 1
              }}>AWS</button>
          <button 
              type="button"
              onClick={() => setBackendType && setBackendType('OCI')}
              title="Use OCI Backend"
              disabled={isSending}
              style={{ 
                  padding: '0 12px', 
                  height: '100%',
                  background: backendType === 'OCI' ? '#1F7246' : '#fff', 
                  color: backendType === 'OCI' ? '#fff' : '#666',
                  border: 'none',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  borderLeft: '1px solid #e0e0e0',
                  opacity: isSending ? 0.7 : 1
              }}>OCI</button>
      </div>
    </div>
  );
});

export default ChatInput;

