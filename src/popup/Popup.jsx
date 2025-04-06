import React, { useState, useEffect } from 'react';
import './popup.css'; // Import the CSS for styling

const Popup = () => {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes for focus
  const [isFocus, setIsFocus] = useState(true); // Start with focus

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

  // Start or stop the timer
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Switch between focus and break periods
  const switchPeriod = (target) => {
    if (target === 'focus') {
      setIsFocus(true);
      setTimeLeft(25 * 60); // 25 minutes for focus
    } else {
      setIsFocus(false);
      setTimeLeft(5 * 60); // 5 minutes for break
    }
  };

  // Countdown logic
  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      switchPeriod(isFocus ? 'break' : 'focus'); // Switch to break or focus when the timer reaches zero
    }

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, isFocus]);

  // Format time left as mm:ss
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="popup-container">
      <h2 className="popup-title">Consist</h2>

      <div className="timer-options">
        <button className="timer-option-btn" onClick={() => switchPeriod('focus')}>Focus</button>
        <button className="timer-option-btn" onClick={() => switchPeriod('break')}>Break</button>
      </div>

      <div className="timer-container">
        <div className="timer-label">
          {isFocus ? "Focus" : "Break"}
        </div>
        <div className="timer">{formatTime(timeLeft)}</div>
        <div className="timer-buttons">
          <button className="timer-btn" onClick={toggleTimer}>
            {isTimerRunning ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      <div className="toggle-container">
        <span className="focus-text">Focus</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isBlockingEnabled}
            onChange={toggleBlocking}
            disabled={!isFocus} // Disable the toggle during break
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );
};

export default Popup;
