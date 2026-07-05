import React, { useState, useEffect } from 'react'
import AuthGuard from './components/AuthGuard'
import SettingsModal from './components/SettingsModal'
import ChatInterface from './components/ChatInterface'
import MemoSidebar from './components/MemoSidebar'

export default function App() {
  const [userToken, setUserToken] = useState(() => {
    return sessionStorage.getItem('user_token') || ''
  })

  const [keys, setKeys] = useState(() => {
    const saved = sessionStorage.getItem('keys')
    return saved ? JSON.parse(saved) : { geminiKey: '', mcpToken: '' }
  })

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMemoOpen, setIsMemoOpen] = useState(true)
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [memos, setMemos] = useState([])

  // Load configuration on user token change
  useEffect(() => {
    if (userToken) {
      fetchSessions()
      fetchMemos()
      
      // Auto-open settings if keys are not set
      if (!keys.geminiKey || !keys.mcpToken) {
        setIsSettingsOpen(true)
      }
    } else {
      setSessions([])
      setMessages([])
      setMemos([])
      setActiveSessionId('')
    }
  }, [userToken])

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId && userToken) {
      fetchMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  const handleLogin = (token) => {
    sessionStorage.setItem('user_token', token)
    setUserToken(token)
  }

  const handleSaveKeys = (newKeys) => {
    sessionStorage.setItem('keys', JSON.stringify(newKeys))
    setKeys(newKeys)
  }

  // --- API Integrations ---

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions', {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()
      setSessions(data)
      // Auto-select first session if available and none selected
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateSession = async (title) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ title })
      })
      if (!res.ok) throw new Error('Failed to create session')
      const newSession = await res.json()
      setSessions(prev => [newSession, ...prev])
      setActiveSessionId(newSession.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error('Failed to delete session')
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMessages = async (sessionId) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMemos = async () => {
    try {
      const res = await fetch('/api/memos', {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error('Failed to fetch memos')
      const data = await res.json()
      setMemos(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddLocalMessage = (msg) => {
    setMessages(prev => [...prev, msg])
  }

  return (
    <AuthGuard userToken={userToken} onLogin={handleLogin}>
      <div className="flex h-screen w-screen overflow-hidden bg-darkBg text-gray-200">
        {/* Main Work Area */}
        <ChatInterface
          userToken={userToken}
          keys={keys}
          onOpenSettings={() => setIsSettingsOpen(true)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          messages={messages}
          onSelectSession={setActiveSessionId}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onAddMessage={handleAddLocalMessage}
          onRefreshMemos={fetchMemos}
        />

        {/* Database Memos Drawer */}
        <MemoSidebar
          isOpen={isMemoOpen}
          toggleOpen={() => setIsMemoOpen(!isMemoOpen)}
          memos={memos}
          onRefresh={fetchMemos}
        />

        {/* Settings Modal overlay */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          keys={keys}
          onSaveKeys={handleSaveKeys}
        />
      </div>
    </AuthGuard>
  )
}
