import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Disable right-click context menu
window.addEventListener("contextmenu", e => e.preventDefault());

// Disable dragging of all images... and everything else
document.addEventListener("dragstart", function (e) {
    e.preventDefault();
});
