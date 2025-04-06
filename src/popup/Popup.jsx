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
        window.close();
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(
      ['blockingEnabled', 'currentMode', 'darkMode', 'focusDuration', 'breakDuration'],
      (result) => {
        setIsBlockingEnabled(result.blockingEnabled ?? true);
        setIsFocus(result.currentMode !== 'break');
        setIsDarkMode(result.darkMode ?? false);
        setFocusDuration(result.focusDuration ?? 25 * 60);
        setBreakDuration(result.breakDuration ?? 5 * 60);

        if (result.darkMode) document.body.classList.add('dark');
      }
    );

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

  const toggleTimer = () => {
    const newState = !isTimerRunning;
    setIsTimerRunning(newState);
    chrome.runtime.sendMessage({ type: newState ? 'START_TIMER' : 'STOP_TIMER' });
  };

  const switchMode = (mode) => {
    const goingFocus = mode === 'focus';
    setIsFocus(goingFocus);
    setTimeLeft(goingFocus ? focusDuration : breakDuration);
    chrome.runtime.sendMessage({ type: 'SWITCH_MODE', payload: mode });
    chrome.storage.local.set({ currentMode: mode });
    goingFocus ? focusSound.play() : breakSound.play();
  };

  const toggleBlocking = () => {
    const next = !isBlockingEnabled;
    setIsBlockingEnabled(next);
    chrome.storage.local.set({ blockingEnabled: next });
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    chrome.storage.local.set({ darkMode: next });
    document.body.classList.toggle('dark', next);
  };

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="popup-wrapper">
      <div className="popup-top-left">Consist.</div>

      <div className="popup-mode-toggle">
        <button
          className={`popup-mode-btn ${isFocus ? 'active' : ''}`}
          onClick={() => switchMode('focus')}
        >
          Focus
        </button>
        <button
          className={`popup-mode-btn ${!isFocus ? 'active' : ''}`}
          onClick={() => switchMode('break')}
        >
          Break
        </button>
      </div>

      <div className="popup-timer-display">{formatTime(timeLeft)}</div>

      <div className="popup-controls">
        <button className="popup-start-btn" onClick={toggleTimer}>
          {isTimerRunning ? 'Stop' : 'Start'}
        </button>

        <label className="popup-focus-switch">
          <span>Focus</span>
          <input
            type="checkbox"
            checked={isBlockingEnabled}
            onChange={toggleBlocking}
            disabled={!isFocus}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="popup-bottom-left">
        <button className="popup-dark-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="popup-bottom-right">
        <a href="landing.html" target="_blank" rel="noopener noreferrer">
          🏠 Home
        </a>
      </div>
    </div>
  );
};

export default Popup;
