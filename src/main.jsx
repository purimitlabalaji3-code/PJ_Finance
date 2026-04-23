import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App.jsx'
import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'

// ── Service Worker Registration + Auto-Update System ─────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[SW] Registered');

        // Check for updates periodically
        setInterval(() => { reg.update(); }, 1000 * 60 * 60); // Every hour

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; please refresh.
                  console.log('[SW] New version available, auto-reloading...');
                  toast.success('App updated! Reloading...', { duration: 3000 });
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                } else {
                  // Content is cached for offline use.
                  console.log('[SW] Content cached for offline use.');
                }
              }
            };
          }
        };
      })
      .catch(err => console.error('[SW] Registration failed:', err));
  });

  // Handle case where new SW takes over
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// ── Error Boundary — prevents full white screen on JS errors ──────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0D0D0D', color: '#fff', padding: '2rem', textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            App Compatibility Issue
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.state.error?.message || 'The app encountered a technical error on this device.'}
          </p>
          <button
            onClick={() => {
              // Clear cache and reload on crash
              if ('caches' in window) {
                caches.keys().then(names => names.forEach(name => caches.delete(name)));
              }
              window.location.reload();
            }}
            style={{
              background: '#FFD700', color: '#000', border: 'none',
              padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
              fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem'
            }}
          >
            Reset & Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Toaster position="top-center" />
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
