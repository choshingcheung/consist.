import React, { useState, useEffect } from 'react';
import './popup.css'; // Import the CSS for styling

const Popup = () => {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);

  // Load the current state from localStorage (or any other persistent storage)
  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('blockingEnabled'));
    if (savedState !== null) {
      setIsBlockingEnabled(savedState);
    }
  }, []);

  // Save the state to localStorage
  const toggleBlocking = () => {
    const newState = !isBlockingEnabled;
    setIsBlockingEnabled(newState);
    localStorage.setItem('blockingEnabled', JSON.stringify(newState));

    // Send a message to content.js to toggle blocking
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (newState) => {
          // Assuming you have a global variable for the blocking status
          window.isBlockingEnabled = newState;
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
