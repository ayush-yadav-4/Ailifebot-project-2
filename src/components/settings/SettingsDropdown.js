import React, { useState, useEffect, useRef } from 'react';

/**
 * Settings Dropdown Component
 * Settings menu with various options
 */
function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    
    switch (action) {
      case 'add':
        // Add new prompt functionality
        if (window.addNewPrompt) {
          window.addNewPrompt();
        }
        break;
      case 'edit':
        // Edit prompts functionality
        if (window.editPrompts) {
          window.editPrompts();
        }
        break;
      case 'delete':
        // Delete prompts functionality
        if (window.deletePrompts) {
          window.deletePrompts();
        }
        break;
      case 'recent':
        // Show recent pages
        break;
      case 'about':
        // Show about modal
        break;
      case 'settings':
        // Show settings
        break;
      case 'clear-cache':
        // Clear all caches
        if (window.confirm('Are you sure you want to clear all caches?')) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }
        break;
      case 'feedback':
        // Send feedback via email
        const email = 'feedback@CGMSCL.com';
        const subject = 'CGMSCL Feedback';
        const body = 'Please share your feedback about CGMSCL:\n\n';
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      default:
        break;
    }
  };

  return (
    <div className="settings-dropdown" ref={dropdownRef}>
      <div 
        className="settings-menu" 
        role="menu" 
        aria-hidden={!isOpen}
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0)' : 'translateY(-8px)'
        }}
      >
        {/* CRUD options */}
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="add" 
          tabIndex="0"
          onClick={() => handleAction('add')}
        >
          <i className="fas fa-plus"></i>
          <span>Add</span>
        </div>
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="edit" 
          tabIndex="0"
          onClick={() => handleAction('edit')}
        >
          <i className="fas fa-edit"></i>
          <span>Edit</span>
        </div>
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="delete" 
          tabIndex="0"
          onClick={() => handleAction('delete')}
        >
          <i className="fas fa-trash"></i>
          <span>Delete</span>
        </div>
        
        <div className="settings-separator"></div>
        
        {/* Existing options */}
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="recent" 
          tabIndex="0"
          onClick={() => handleAction('recent')}
        >
          <i className="fas fa-clock"></i>
          <span>Recent pages</span>
        </div>
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="about" 
          tabIndex="0"
          onClick={() => handleAction('about')}
        >
          <i className="fas fa-info-circle"></i>
          <span>About</span>
        </div>
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="settings" 
          tabIndex="0"
          onClick={() => handleAction('settings')}
        >
          <i className="fas fa-cog"></i>
          <span>Setting</span>
        </div>
        
        <div className="settings-separator"></div>
        
        {/* Feedback */}
        {/* <div 
          className="settings-item" 
          role="menuitem" 
          data-action="feedback" 
          tabIndex="0"
          onClick={() => handleAction('feedback')}
        >
          <i className="fas fa-comment-dots"></i>
          <span>Send Feedback</span>
        </div> */}
        
        <div className="settings-separator"></div>
        
        {/* Cache Management */}
        <div 
          className="settings-item" 
          role="menuitem" 
          data-action="clear-cache" 
          tabIndex="0"
          onClick={() => handleAction('clear-cache')}
        >
          <i className="fas fa-trash-alt"></i>
          <span>Clear All Caches</span>
        </div>
      </div>
    </div>
  );
}

export default SettingsDropdown;

