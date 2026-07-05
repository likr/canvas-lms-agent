import React, { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Loader, Settings, Plus, Trash2, Shield, AlertCircle, Play, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function ChatInterface({
  userToken,
  keys,
  onOpenSettings,
  sessions,
  activeSessionId,
  messages,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onAddMessage,
  onRefreshMemos
}) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Streaming state for current assistant response
  const [streamingText, setStreamingText] = useState('')
  const [streamingThought, setStreamingThought] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [toolLogs, setToolLogs] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [showThought, setShowThought] = useState(true)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText, streamingThought, toolLogs])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    if (!activeSessionId) {
      setErrorMsg('Please select or create a session first.')
      return
    }

    const currentMessage = input
    setInput('')
    setIsLoading(true)
    setErrorMsg('')
    setStreamingText('')
    setStreamingThought('')
    setActiveTool(null)
    setToolLogs([])

    // Optimistically add user message to list
    onAddMessage({
      role: 'user',
      content: currentMessage,
      created_at: new Date().toISOString()
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'X-LLM-API-Key': keys.geminiKey,
          'X-MCP-Token': keys.mcpToken
        },
        body: JSON.stringify({
          session_id: activeSessionId,
          message: currentMessage
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Internal server error')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullAssistantText = ''
      let fullAssistantThought = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6)
            if (jsonStr.trim()) {
              try {
                const data = JSON.parse(jsonStr)
                
                if (data.type === 'thought') {
                  fullAssistantThought += data.text
                  setStreamingThought(fullAssistantThought)
                } else if (data.type === 'text') {
                  fullAssistantText += data.text
                  setStreamingText(fullAssistantText)
                } else if (data.type === 'tool_call') {
                  const args = JSON.stringify(data.arguments || {})
                  const logMsg = `Executing: ${data.name}(${args})`
                  setActiveTool(data.name)
                  setToolLogs(prev => [...prev, { name: data.name, args: args, status: 'running' }])
                  // Trigger memo list sync if memo was written
                  if (data.name === 'write_memo') {
                    setTimeout(() => onRefreshMemos(), 2000)
                  }
                } else if (data.type === 'status') {
                  if (data.status === 'Completed') {
                    setActiveTool(null)
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.error)
                }
              } catch (parseErr) {
                console.error('SSE parsing error', parseErr)
              }
            }
          }
        }
      }

      // Add final assistant message to session messages list
      onAddMessage({
        role: 'model',
        content: fullAssistantText,
        thinking: fullAssistantThought,
        created_at: new Date().toISOString()
      })
      setStreamingText('')
      setStreamingThought('')
      setToolLogs([])

    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to chat with agent.')
    } finally {
      setIsLoading(false)
      setActiveTool(null)
      onRefreshMemos() // Sync memos
    }
  }

  return (
    <div className="flex flex-1 h-full bg-[#0D1117] overflow-hidden">
      
      {/* Sessions Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-[#161B22] flex flex-col h-full">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => onCreateSession(`Chat ${sessions.length + 1}`)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-sm font-semibold bg-brandBlue/15 hover:bg-brandBlue/25 border border-brandBlue/30 text-brandBlue transition duration-200"
          >
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-8">
              No sessions created
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition duration-200 ${
                  activeSessionId === session.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className="truncate flex-1">{session.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-red-400 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-14 border-b border-gray-800 bg-[#161B22] flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-brandBlue animate-pulse" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">Canvas Assistant Workspace</h1>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-800 hover:bg-gray-800 text-xs font-semibold text-gray-300 transition duration-200"
          >
            <Settings className="h-3.5 w-3.5" /> Setup API Keys
          </button>
        </header>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-800/35 rounded-xl text-xs text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {messages.length === 0 && !streamingText && !streamingThought && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <Bot className="h-12 w-12 text-gray-700 mb-3" />
              <h3 className="font-bold text-white text-base">Antigravity Canvas Assistant</h3>
              <p className="max-w-md text-xs text-gray-500 mt-1 leading-relaxed">
                Connect and control your Canvas LMS courses and records. Ask me to list courses, find assignments, submit homework, or check grades. All instructions are strictly restricted to Canvas actions.
              </p>
            </div>
          )}

          {/* Render past messages */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Icon */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-md ${
                  msg.role === 'user' ? 'bg-brandBlue text-white' : 'bg-brandPurple text-white'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble content */}
                <div className="space-y-2">
                  <div className={`rounded-2xl px-4 py-3 shadow-md text-sm border leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brandBlue/15 border-brandBlue/35 text-white'
                      : 'bg-gray-900/60 border-gray-800/80 text-gray-100'
                  }`}>
                    {/* Render Thought Process if exists in historical model response */}
                    {msg.thinking && (
                      <div className="mb-3 border-b border-gray-800/50 pb-2">
                        <details className="outline-none group">
                          <summary className="flex items-center gap-1.5 text-xs text-gray-500 font-medium cursor-pointer list-none select-none">
                            <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
                            <span>View Thinking Process</span>
                          </summary>
                          <div className="mt-2 text-xs text-gray-400 font-mono bg-[#0D1117] p-3 rounded-lg border border-gray-800 leading-relaxed whitespace-pre-wrap">
                            {msg.thinking}
                          </div>
                        </details>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {/* Render active streaming response */}
          {(streamingText || streamingThought || toolLogs.length > 0) && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brandPurple text-white flex items-center justify-center shadow-md animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                
                <div className="space-y-2">
                  <div className="rounded-2xl px-4 py-3 bg-gray-900/60 border border-gray-800/80 text-gray-100 shadow-md text-sm leading-relaxed">
                    
                    {/* Render live thought stream */}
                    {streamingThought && (
                      <div className="mb-3 border-b border-gray-800/50 pb-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5"><Loader className="h-3 w-3 animate-spin text-brandPurple" /> Thinking...</span>
                          <button onClick={() => setShowThought(!showThought)} className="hover:text-white transition">
                            {showThought ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {showThought && (
                          <div className="mt-2 text-xs text-gray-400 font-mono bg-[#0D1117] p-3 rounded-lg border border-gray-800 leading-relaxed whitespace-pre-wrap">
                            {streamingThought}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Render active tool logs */}
                    {toolLogs.length > 0 && (
                      <div className="space-y-1.5 mb-3 bg-[#0D1117]/80 border border-gray-800 p-2.5 rounded-xl text-xs font-mono">
                        {toolLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-gray-400">
                            {activeTool === log.name ? (
                              <Play className="h-3 w-3 text-brandBlue animate-pulse mt-0.5" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5" />
                            )}
                            <span className={activeTool === log.name ? 'text-brandBlue font-semibold' : 'text-gray-500'}>
                              {log.name}: {log.args}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render text stream */}
                    {streamingText ? (
                      <div className="whitespace-pre-wrap">{streamingText}</div>
                    ) : (
                      !streamingThought && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Loader className="h-3.5 w-3.5 animate-spin" /> Preparing response...
                        </div>
                      )
                    )}

                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <footer className="p-4 border-t border-gray-800 bg-[#161B22]">
          <form onSubmit={handleSend} className="relative flex rounded-2xl border border-gray-800 bg-[#0D1117] focus-within:border-brandBlue transition duration-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !activeSessionId}
              placeholder={activeSessionId ? "Type your Canvas command (e.g. List my courses)..." : "Create or select a session to start chatting..."}
              className="w-full bg-transparent px-5 py-4 text-sm text-white focus:outline-none disabled:text-gray-600 disabled:placeholder-gray-700"
            />
            <div className="flex items-center pr-3">
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !activeSessionId}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandBlue hover:opacity-90 text-[#0D1117] disabled:bg-gray-800 disabled:text-gray-600 transition"
              >
                {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
          <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 px-1">
            <span className="flex items-center gap-1 text-brandBlue"><Shield className="h-3 w-3" /> Secure BYOK Sandbox</span>
            <span>FastAPI + PostgreSQL Memory Backend</span>
          </div>
        </footer>

      </div>
    </div>
  )
}
