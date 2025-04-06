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
    chrome.storage.local.set({ blockingEnabled: newState });

    // Optionally, notify content.js that the state has changed (for debugging)
    console.log("Blocking state changed:", newState);
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
