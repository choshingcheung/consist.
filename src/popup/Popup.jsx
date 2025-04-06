import React, { useState, useEffect } from 'react';
import './popup.css'; // Import the CSS for styling

const Popup = () => {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);

  // Load the current state from chrome.storage
  useEffect(() => {
    chrome.storage.local.get('blockingEnabled', (result) => {
      if (result.blockingEnabled !== undefined) {
        setIsBlockingEnabled(result.blockingEnabled);
      }
    });
  }, []);

  // Save the state to chrome.storage
  const toggleBlocking = () => {
    const newState = !isBlockingEnabled;
    setIsBlockingEnabled(newState);
    localStorage.setItem('blockingEnabled', JSON.stringify(newState)); // This can be removed if you're using chrome.storage
  
    // Save the state to chrome.storage
    chrome.storage.local.set({ blockingEnabled: newState });
  
    // Send a message to content.js to update blocking state
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (newState) => {
          window.isBlockingEnabled = newState;  // Update the global state in content script
        },
        args: [newState]
      });
    });
  };
  

  return (
    <div className="popup-container">
      <h2 className="popup-title">Consist</h2>
      <div className="toggle-container">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isBlockingEnabled}
            onChange={toggleBlocking}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );
};

export default Popup;