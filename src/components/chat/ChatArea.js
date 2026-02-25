import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';
import PromptGalleryModal from '../modals/PromptGalleryModal';

/**
 * Chat Area Component
 * Main chat interface for conversations
 */
function ChatArea({ chatHistory, onSendMessage, onReceiveResponse, onNewChat, isSending, backendType, setBackendType }) {
  const [messages, setMessages] = useState(chatHistory);
  const [showPromptGallery, setShowPromptGallery] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    setMessages(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message) => {
    // Delegate sending to parent (App) so both WelcomeScreen and ChatInput share the same flow
    await onSendMessage(message);
  };     

  const handlePromptSelect = (prompt) => {
    chatInputRef.current?.setValue(prompt);
    setShowPromptGallery(false);
  };

  // Show floating gallery button only after at least one assistant response exists,
  // and hide it while generating a response (isSending).
  // The button appears under the response, matching the behavior in igl.html.
  const hasAssistantResponse = messages.some((msg) => msg.role === 'assistant');
  const shouldShowGalleryButton = hasAssistantResponse && !isSending;

  return (
    <div className="chat-area has-header" id="chat-area">
      <ChatHeader onNewChat={onNewChat} />
      
      <div className="chat-messages chat-container" id="chat-container">
        <ChatMessages messages={messages} isSending={isSending} />

        {shouldShowGalleryButton && (
          <div className="floating-suggestions-container inline-floating" data-floating="gallery-btn">
            <div className="floating-suggestions-wrapper">
              <ChatSuggestions
                onOpenPromptGallery={() => setShowPromptGallery(true)}
              /> 
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-wrapper">
        <ChatInput 
          ref={chatInputRef} 
          onSend={handleSend} 
          isSending={isSending} 
          backendType={backendType}
          setBackendType={setBackendType}
        />
      </div>

      {showPromptGallery && (
        <PromptGalleryModal
          onClose={() => setShowPromptGallery(false)}
          onPromptSelect={handlePromptSelect}
        />
      )}
    </div>
  );
}

export default ChatArea;

