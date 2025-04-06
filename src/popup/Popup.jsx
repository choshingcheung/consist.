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

  useEffect(() => {
    chrome.storage.local.get(['blockingEnabled', 'currentMode'], (result) => {
      if (typeof result.blockingEnabled !== 'undefined') {
        setIsBlockingEnabled(result.blockingEnabled);
      }
      if (result.currentMode === 'break') {
        setIsFocus(false);
        setTimeLeft(5 * 60);
      } else {
        setIsFocus(true);
        setTimeLeft(25 * 60);
      }
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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (newState) => {
          window.isBlockingEnabled = newState;
        },
        args: [newState]
      });
    });
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
    document.body.classList.toggle('dark', newMode);
  };

  const switchPeriod = (target) => {
    const goingFocus = target === 'focus';
    chrome.runtime.sendMessage({
      type: 'SWITCH_MODE',
      payload: target
    });

    chrome.storage.local.set({ currentMode: target });

    if (goingFocus) {
      focusSound.play();
    } else {
      breakSound.play();
    }

    setIsFocus(goingFocus);
    setTimeLeft(goingFocus ? 25 * 60 : 5 * 60);
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
              cx="80"
              cy="80"
              r="70"
              className="timer-ring"
              style={{
                strokeDashoffset: 440 - (440 * timeLeft) / (isFocus ? 25 * 60 : 5 * 60)
              }}
            />
          </svg>
          <div className="timer-text">{formatTime(timeLeft)}</div>
        </div>

        <div className="timer-buttons">
          <button className="timer-btn" onClick={toggleTimer}>
            {isTimerRunning ? "Stop" : "Start"}
          </button>
          <button className="timer-btn" onClick={toggleDarkMode}>🌓</button>
        </div>
      </div>

      <div className="toggle-container">
        <span className="focus-text">Focus</span>
        <label className="toggle-switch" title="Enable/disable blocking during focus">
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
