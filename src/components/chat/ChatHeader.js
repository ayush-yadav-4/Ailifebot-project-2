import React from 'react';
import AnalysisToggle from '../welcome/AnalysisToggle';
import logoImage from '../../assets/images/motherson2.png';

/**
 * Chat Header Component
 * Header for chat area with controls
 */
function ChatHeader({ onNewChat }) {
  return (
    <div className="chat-glassmorphism-header" id="chat-glassmorphism-header">
      <div className="chat-header-left">
        <img 
          src={logoImage} 
          alt="CGMSCL Logo" 
          className="chat-header-logo" 
          onClick={onNewChat}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className="chat-header-right">
        <button className="new-chat-btn" onClick={onNewChat} aria-label="New Chat">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
            <mask id="mask0_chat" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20" style={{ maskType: 'alpha' }}>
              <path d="M19.7803 1.28033C20.0732 0.987435 20.0732 0.512561 19.7803 0.219669C19.4874 -0.0732238 19.0125 -0.0732228 18.7196 0.219671L8.71967 10.2197L8.25 11.75L9.78033 11.2803L19.7803 1.28033ZM4.25 1C2.45507 1 1 2.45508 1 4.25V15.75C1 17.5449 2.45507 19 4.25 19H15.75C17.5449 19 19 17.5449 19 15.75V7.75C19 7.33579 18.6642 7 18.25 7C17.8358 7 17.5 7.33579 17.5 7.75V15.75C17.5 16.7165 16.7165 17.5 15.75 17.5H4.25C3.2835 17.5 2.5 16.7165 2.5 15.75V4.25C2.5 3.2835 3.2835 2.5 4.25 2.5H12.25C12.6642 2.5 13 2.16421 13 1.75C13 1.33579 12.6642 1 12.25 1H4.25Z" fill="currentColor"></path>
            </mask>
            <g mask="url(#mask0_chat)">
              <rect width="24" height="24" transform="translate(-2 -2)" fill="currentColor"></rect>
            </g>
          </svg>
        </button>
        
        <AnalysisToggle location="chat" />
      </div>
    </div>
  );
}

export default ChatHeader;

