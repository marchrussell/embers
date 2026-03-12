import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress unhandled AbortErrors originating from Supabase Realtime internals.
// These are thrown when the client aborts its own internal WebSocket/fetch connections
// (e.g. during auth state changes) and escape the Supabase client's own error handling.
// They are harmless — nothing in application code awaits these promises.
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof DOMException && event.reason.name === 'AbortError') {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
