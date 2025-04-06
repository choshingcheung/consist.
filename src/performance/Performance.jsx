import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import './performance.css';

const dummyFocusData = [
  { day: 'Mon', minutes: 80 },
  { day: 'Tue', minutes: 60 },
  { day: 'Wed', minutes: 90 },
  { day: 'Thu', minutes: 50 },
  { day: 'Fri', minutes: 70 },
  { day: 'Sat', minutes: 100 },
  { day: 'Sun', minutes: 30 },
];

const COLORS = ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9', '#e8f5e9', '#dcedc8'];

const Performance = () => {
  const [focusData, setFocusData] = useState(dummyFocusData);
  const [goal, setGoal] = useState(90);
  const [todayMinutes, setTodayMinutes] = useState(70);
  const [streak, setStreak] = useState(3);
  const [history, setHistory] = useState([
    { date: '2025-03-24', minutes: 80 },
    { date: '2025-03-25', minutes: 90 },
    { date: '2025-03-26', minutes: 60 },
    { date: '2025-03-27', minutes: 70 },
    { date: '2025-03-28', minutes: 50 },
    { date: '2025-03-29', minutes: 100 },
    { date: '2025-03-30', minutes: 30 },
    { date: '2025-03-31', minutes: 85 },
    { date: '2025-04-01', minutes: 60 },
    { date: '2025-04-02', minutes: 90 },
    { date: '2025-04-03', minutes: 45 },
    { date: '2025-04-04', minutes: 75 },
    { date: '2025-04-05', minutes: 100 },
    { date: '2025-04-06', minutes: 70 }
  ]);

  useEffect(() => {
    chrome.storage.local.get(['darkMode'], (res) => {
      const dark = res.darkMode ?? false;
      if (dark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });
  }, []);  

  return (
    <div className="performance-container">
      <h1 className="performance-title">📊 Performance Dashboard</h1>
      <div className="performance-grid">
        <div className="metrics">
          <div className="metric-card">
            <label>🎯 Daily Goal (min)</label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="metric-card">
            <p>🔥 Streak: <strong>{streak} days</strong></p>
            <p>⏱️ Today: <strong>{todayMinutes} / {goal} min</strong></p>
          </div>
          <div className="metric-card history">
            <h3>🗓️ 14-Day History</h3>
            <table>
              <thead><tr><th>Date</th><th>Minutes</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}><td>{h.date}</td><td>{h.minutes}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="charts">
          <div className="chart-section">
            <h2>Weekly Focus Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={focusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#4caf50" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h2>Focus Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={focusData}
                  dataKey="minutes"
                  nameKey="day"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {focusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="performance-nav">
        <a href="landing.html" className="nav-btn">🏠 Home</a>
        <a href="settings.html" className="nav-btn">⚙️ Settings</a>
      </div>
    </div>
  );
};

export default Performance;
