import React from 'react';
import ReactDOM from 'react-dom/client';  // Import ReactDOM from 'react-dom/client'
import Popup from './Popup';  // Corrected component import

const root = ReactDOM.createRoot(document.getElementById('root'));  // Create root for React 18
root.render(<Popup />);  // Use render method on root to render the component
