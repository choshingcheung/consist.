import React, { useState, useEffect } from 'react';
import './popup.css';

const Popup = () => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);

  // Format timer
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const syncState = () => {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
      if (!res) return;
      setTimeLeft(res.timeLeft);
      setIsRunning(res.isRunning);
      setIsFocus(res.isFocus);
      setIsBlockingEnabled(res.isFocus);
    });
  };

  // Sync on mount
  useEffect(() => {
    syncState();

    const interval = setInterval(() => {
      syncState();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const listener = (msg) => {
      if (msg.type === 'TIMER_UPDATE') {
        setTimeLeft(msg.timeLeft);
        setIsRunning(msg.isRunning);
        setIsFocus(msg.isFocus);
        setIsBlockingEnabled(msg.isFocus);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const toggleTimer = () => {
    chrome.runtime.sendMessage({ type: isRunning ? 'STOP_TIMER' : 'START_TIMER' });
    setIsRunning(!isRunning);
  };

  const switchMode = (mode) => {
    chrome.runtime.sendMessage({ type: 'SWITCH_MODE', payload: mode });
  };

  const toggleBlocking = () => {
    const newState = !isBlockingEnabled;
    chrome.storage.local.set({ blockingEnabled: newState });
    setIsBlockingEnabled(newState);
  };

  return (
    <div className="popup-container">
      <h2 className="popup-title">Consist</h2>

      <div className="timer-options">
        <button className="timer-option-btn" onClick={() => switchMode('focus')}>Focus</button>
        <button className="timer-option-btn" onClick={() => switchMode('break')}>Break</button>
      </div>

      <div className="timer-container">
        <div className="timer-label">{isFocus ? 'Focus' : 'Break'}</div>
        <div className="timer">{formatTime(timeLeft)}</div>
        <div className="timer-buttons">
          <button className="timer-btn" onClick={toggleTimer}>
            {isRunning ? 'Stop' : 'Start'}
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
            disabled={!isFocus}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );
};

export default Popup;
