import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Defensive polyfill for PUBLIC_URL to avoid ReferenceError at build time.
 * Ensures PUBLIC_URL is always defined in both window and process.env.
 */
if (typeof window !== 'undefined' && typeof window.PUBLIC_URL === 'undefined') {
  window.PUBLIC_URL = '.';
}
if (typeof process !== 'undefined' && process.env && typeof process.env.PUBLIC_URL === 'undefined') {
  process.env.PUBLIC_URL = '.';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
