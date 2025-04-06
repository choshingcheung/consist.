import React, { useState, useEffect } from 'react';
import './settings.css';

const Settings = () => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [whitelist, setWhitelist] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    chrome.storage.local.get('isLoggedIn', (res) => {
      if (!res.isLoggedIn) {
        window.location.href = 'login.html';
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(['focusDuration', 'breakDuration', 'whitelist', 'darkMode'], (res) => {
      if (res.focusDuration) setFocusMinutes(res.focusDuration / 60);
      if (res.breakDuration) setBreakMinutes(res.breakDuration / 60);
      if (res.whitelist) setWhitelist(res.whitelist.join(', '));
      if (res.darkMode) setDarkMode(true);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({
      focusDuration: focusMinutes * 60,
      breakDuration: breakMinutes * 60,
      whitelist: whitelist.split(',').map(site => site.trim()),
      darkMode
    });
    alert('✅ Settings saved!');
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <h1>⚙️ Settings</h1>

      <div className="setting-group">
        <label>Focus Duration (mins)</label>
        <input type="number" value={focusMinutes} onChange={e => setFocusMinutes(e.target.value)} />
      </div>

      <div className="setting-group">
        <label>Break Duration (mins)</label>
        <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(e.target.value)} />
      </div>

      <div className="setting-group">
        <label>Focus Whitelist (comma-separated domains)</label>
        <textarea value={whitelist} onChange={e => setWhitelist(e.target.value)} rows={4}></textarea>
      </div>

      <div className="setting-group toggle">
        <label>🌙 Dark Mode</label>
        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(prev => !prev)} />
      </div>

      <button className="save-btn" onClick={handleSave}>Save Settings</button>

      <div className="settings-nav">
      <a href="landing.html" className="nav-btn">🏠 Home</a>
      <a href="performance.html" className="nav-btn">📊 Performance</a>
      </div>
    </div>
  );
};

export default Settings;
