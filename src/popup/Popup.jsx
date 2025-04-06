import React, { useState, useEffect } from 'react';
import './popup.css';

const focusSound = new Audio(chrome.runtime.getURL('sounds/fb.wav'));
const breakSound = new Audio(chrome.runtime.getURL('sounds/fb.wav'));

const Popup = () => {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isFocus, setIsFocus] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);

  useEffect(() => {
    chrome.storage.local.get('isLoggedIn', (res) => {
      if (!res.isLoggedIn) {
        chrome.tabs.create({ url: chrome.runtime.getURL('login.html') });
        window.close(); // close the popup
      }      
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(['blockingEnabled', 'currentMode', 'darkMode', 'focusDuration', 'breakDuration'], (result) => {
      if (typeof result.blockingEnabled !== 'undefined') {
        setIsBlockingEnabled(result.blockingEnabled);
      }
      if (result.currentMode === 'break') {
        setIsFocus(false);
      } else {
        setIsFocus(true);
      }
      if (result.darkMode) {
        document.body.classList.add("dark");
        setIsDarkMode(true);
      }
      if (result.focusDuration) setFocusDuration(result.focusDuration);
      if (result.breakDuration) setBreakDuration(result.breakDuration);
    });

    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
      if (res) {
        setIsTimerRunning(res.isRunning);
        setTimeLeft(res.timeLeft);
        setIsFocus(res.isFocus);
      }
    });

    const handleUpdate = (msg) => {
      if (msg.type === 'TIMER_UPDATE') {
        setIsTimerRunning(msg.isRunning);
        setTimeLeft(msg.timeLeft);
        setIsFocus(msg.isFocus);
      }
    };
    chrome.runtime.onMessage.addListener(handleUpdate);
    return () => chrome.runtime.onMessage.removeListener(handleUpdate);
  }, []);

  const toggleBlocking = () => {
    const newState = !isBlockingEnabled;
    setIsBlockingEnabled(newState);
    chrome.storage.local.set({ blockingEnabled: newState });
  };

  const toggleTimer = () => {
    const newRunningState = !isTimerRunning;
    setIsTimerRunning(newRunningState);
    chrome.runtime.sendMessage({
      type: newRunningState ? 'START_TIMER' : 'STOP_TIMER'
    });
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    chrome.storage.local.set({ darkMode: newMode });
    document.body.classList.toggle("dark", newMode);
  };

  const switchPeriod = (target) => {
    const goingFocus = target === 'focus';
    chrome.runtime.sendMessage({
      type: 'SWITCH_MODE',
      payload: target
    });
    chrome.storage.local.set({ currentMode: target });
    if (goingFocus) focusSound.play();
    else breakSound.play();
    setIsFocus(goingFocus);
    setTimeLeft(goingFocus ? focusDuration : breakDuration);
  };

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
        <div className="timer-label">{isFocus ? "Focus" : "Break"}</div>
        <div className="timer-ring-wrapper">
          <svg width="160" height="160">
            <circle cx="80" cy="80" r="70" stroke="#eee" strokeWidth="8" fill="none" />
            <circle
              cx="80" cy="80" r="70"
              className="timer-ring"
              style={{ strokeDashoffset: 440 - (440 * timeLeft) / (isFocus ? focusDuration : breakDuration) }}
            />
          </svg>
          <div className="timer-text">{formatTime(timeLeft)}</div>
        </div>
        <div className="timer-buttons">
          <button className="timer-btn" onClick={toggleTimer}>{isTimerRunning ? "Stop" : "Start"}</button>
          <button className="timer-btn" onClick={toggleDarkMode}>{isDarkMode ? '☀️' : '🌙'}</button>
        </div>
      </div>
      <div className="toggle-container">
        <span className="focus-text">Focus</span>
        <label className="toggle-switch" title="Enable/disable blocking during focus">
          <input type="checkbox" checked={isBlockingEnabled} onChange={toggleBlocking} disabled={!isFocus} />
          <span className="toggle-slider"></span>
        </label>
      </div>
      <div className="home-link">
        <a href="landing.html" target="_blank" rel="noopener noreferrer">🏠 Home</a>
      </div>
    </div>
  );
};

export default Popup;
