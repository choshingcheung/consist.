import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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

  useEffect(() => {
    // If implementing with chrome.storage.local, fetch and process data here
  }, []);

  return (
    <div className="performance-container">
      <h1 className="performance-title">📊 Focus Summary</h1>

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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="performance-nav">
        <a href="landing.html" className="nav-btn">🏠 Home</a>
        <a href="settings.html" className="nav-btn">⚙️ Settings</a>
      </div>

    </div>
  );
};

export default Performance;
