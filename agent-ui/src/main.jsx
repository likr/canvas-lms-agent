import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

function Root() {
  const [clientId, setClientId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch config')
        return res.json()
      })
      .then((data) => {
        // Use the returned client ID, or default to mock value for local development
        setClientId(data.google_client_id || 'mock-client-id')
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch config, using mock client-id', err)
        setClientId('mock-client-id')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-darkBg text-gray-400">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brandBlue border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm font-medium">Initializing UI configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
