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
      if (!res.isLoggedIn) window.location.href = 'login.html';
    });

    chrome.storage.local.get(
      ['darkMode', 'blockingEnabled', 'currentMode', 'focusDuration', 'breakDuration'],
      (res) => {
        setFocusDuration(res.focusDuration || 1500);
        setBreakDuration(res.breakDuration || 300);
        setIsDarkMode(res.darkMode);
        document.body.classList.toggle('dark', res.darkMode);
        setIsBlockingEnabled(res.blockingEnabled ?? true);

        const isBreak = res.currentMode === 'break';
        setIsFocus(!isBreak);
        setTimeLeft(!isBreak ? focusDuration : breakDuration);
      }
    );

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
    const next = !isRunning;
    setIsRunning(next);
    chrome.runtime.sendMessage({ type: next ? 'START_TIMER' : 'STOP_TIMER' });
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

  const fullDuration = isFocus ? focusDuration : breakDuration;

  return (
    <div className="landing-wrapper">
      <div className="top-left">Consist.</div>

      <div className="center-content">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${isFocus ? 'active' : ''}`}
            onClick={() => switchMode('focus')}
          >
            Focus
          </button>
          <button
            className={`mode-btn ${!isFocus ? 'active' : ''}`}
            onClick={() => switchMode('break')}
          >
            Break
          </button>
        </div>

        <div className="timer-display">{formatTime(timeLeft)}</div>

        <div className="controls">
          <button className="start-btn" onClick={toggleTimer}>
            {isRunning ? 'Stop' : 'Start'}
          </button>

          <label className="focus-switch">
            <span>Focus</span>
            <input type="checkbox" checked={isBlockingEnabled} onChange={toggleBlocking} disabled={!isFocus} />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="bottom-left">
        <button className="dark-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="bottom-right">
        <a href="settings.html" target="_blank">⚙️ Settings</a>
        <a href="performance.html" target="_blank">📊 Performance</a>
      </div>
    </div>
  );
};

export default Landing;