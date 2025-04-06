import React, { useEffect, useState } from 'react';
import './landing.css';



const focusSound = new Audio(chrome.runtime.getURL('sounds/fb.wav'));
const breakSound = new Audio(chrome.runtime.getURL('sounds/fb.wav'));

const Landing = () => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [focusDuration, setFocusDuration] = useState(1500);
  const [breakDuration, setBreakDuration] = useState(300);

  useEffect(() => {
    chrome.storage.local.get('isLoggedIn', (res) => {
      if (!res.isLoggedIn) {
        window.location.href = 'login.html';
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(['darkMode', 'blockingEnabled', 'currentMode', 'focusDuration', 'breakDuration'], (res) => {
      setFocusDuration(res.focusDuration || 1500);
      setBreakDuration(res.breakDuration || 300);

      setIsDarkMode(res.darkMode);
      document.body.classList.toggle('dark', res.darkMode);

      setIsBlockingEnabled(res.blockingEnabled ?? true);
      const isBreak = res.currentMode === 'break';
      setIsFocus(!isBreak);
      setTimeLeft(!isBreak ? (res.focusDuration || 1500) : (res.breakDuration || 300));
    });

    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
      if (res) {
        setIsRunning(res.isRunning);
        setTimeLeft(res.timeLeft);
        setIsFocus(res.isFocus);
      }
    });

    const handleUpdate = (msg) => {
      if (msg.type === 'TIMER_UPDATE') {
        setIsRunning(msg.isRunning);
        setTimeLeft(msg.timeLeft);
        setIsFocus(msg.isFocus);
      }
    };

    chrome.runtime.onMessage.addListener(handleUpdate);
    return () => chrome.runtime.onMessage.removeListener(handleUpdate);
  }, []);

  const toggleTimer = () => {
    const newRunning = !isRunning;
    setIsRunning(newRunning);
    chrome.runtime.sendMessage({ type: newRunning ? 'START_TIMER' : 'STOP_TIMER' });
  };

  const switchMode = (mode) => {
    const isFocusNow = mode === 'focus';
    setIsFocus(isFocusNow);
    setTimeLeft(isFocusNow ? focusDuration : breakDuration);
    chrome.runtime.sendMessage({ type: 'SWITCH_MODE', payload: mode });
    chrome.storage.local.set({ currentMode: mode });
    if (isFocusNow) focusSound.play();
    else breakSound.play();
  };

  const toggleBlocking = () => {
    const newState = !isBlockingEnabled;
    setIsBlockingEnabled(newState);
    chrome.storage.local.set({ blockingEnabled: newState });
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

  const fullDuration = isFocus ? focusDuration : breakDuration;

  return (
    <div className="landing-container">
      <h1 className="landing-title">Consist.</h1>

      <div className="landing-options">
        <button onClick={() => switchMode('focus')} className="landing-btn">Focus</button>
        <button onClick={() => switchMode('break')} className="landing-btn">Break</button>
      </div>

      <div className="landing-timer">
        <div className="label">{isFocus ? 'Focus' : 'Break'}</div>
        <svg width="200" height="200">
          <circle cx="100" cy="100" r="90" stroke="#eee" strokeWidth="10" fill="none" />
          <circle
            cx="100"
            cy="100"
            r="90"
            strokeDasharray="565"
            strokeDashoffset={565 - (565 * timeLeft) / fullDuration}
            className="ring"
          />
        </svg>
        <div className="timer-text">{formatTime(timeLeft)}</div>
      </div>

      <div className="landing-controls">
        <button className="landing-btn" onClick={toggleTimer}>
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button className="landing-btn" onClick={toggleDarkMode}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="landing-toggle">
        <span>Focus</span>
        <label className="switch">
          <input type="checkbox" checked={isBlockingEnabled} onChange={toggleBlocking} disabled={!isFocus} />
          <span className="slider"></span>
        </label>
      </div>

      <div className="landing-settings">
        <a href="settings.html" target="_blank" rel="noopener noreferrer">⚙️ Settings</a>
      </div>

      <div className="landing-performance">
        <a href="performance.html" target="_blank" rel="noopener noreferrer">📊 Performance</a>
      </div>

    </div>
  );
};

export default Landing;
