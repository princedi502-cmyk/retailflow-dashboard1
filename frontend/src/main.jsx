import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { register } from './utils/serviceWorkerRegistration'

// Register service worker
register({
  onSuccess: (registration) => {
    console.log('[App] Service worker registration successful');
  },
  onUpdate: (registration) => {
    console.log('[App] Service worker updated');
    // You can show a notification to the user here
    if (window.confirm('New content available. Reload to update?')) {
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
