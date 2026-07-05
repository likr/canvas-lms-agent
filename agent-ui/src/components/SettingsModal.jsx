import React, { useState, useEffect } from 'react'
import { Key, Wrench, Save, X, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function SettingsModal({ isOpen, onClose, keys, onSaveKeys }) {
  const [geminiKey, setGeminiKey] = useState('')
  const [mcpToken, setMcpToken] = useState('')
  const [showGemini, setShowGemini] = useState(false)
  const [showMcp, setShowMcp] = useState(false)

  useEffect(() => {
    if (keys) {
      setGeminiKey(keys.geminiKey || '')
      setMcpToken(keys.mcpToken || '')
    }
  }, [keys, isOpen])

  const handleSave = (e) => {
    e.preventDefault()
    onSaveKeys({ geminiKey, mcpToken })
    onClose()
  }

  if (!isOpen) return null

  const isConfigured = keys.geminiKey && keys.mcpToken

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-[#161B22] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-brandBlue" />
            <h3 className="text-lg font-bold text-white">API Credentials Setup (BYOK)</h3>
          </div>
          {!isConfigured ? null : (
            <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Warning Alert if keys are missing */}
        {!isConfigured && (
          <div className="mt-4 flex items-start space-x-2 rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-amber-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Setup Credentials to Continue</p>
              <p className="mt-0.5 text-amber-400/80">You must configure your Gemini API Key and Canvas LMS Token to interact with the AI assistant. These keys are kept only in memory and never persisted on our server.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Gemini API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
              <Key className="h-3 w-3 text-brandPurple" /> Gemini API Key
            </label>
            <div className="relative flex rounded-xl border border-gray-800 bg-gray-900 focus-within:border-brandBlue transition">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AI Studio API Key (AIzaSy...)"
                required
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="px-3 text-gray-500 hover:text-white transition"
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              Get one from the{' '}
              <a
                href="https://aistudio.google.com/app/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-brandBlue hover:underline"
              >
                Google AI Studio Console
              </a>.
            </p>
          </div>

          {/* Canvas Access Token */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
              <Wrench className="h-3 w-3 text-brandPurple" /> Canvas LMS Access Token
            </label>
            <div className="relative flex rounded-xl border border-gray-800 bg-gray-900 focus-within:border-brandBlue transition">
              <input
                type={showMcp ? 'text' : 'password'}
                value={mcpToken}
                onChange={(e) => setMcpToken(e.target.value)}
                placeholder="Canvas API Token (e.g. 21824~...)"
                required
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowMcp(!showMcp)}
                className="px-3 text-gray-500 hover:text-white transition"
              >
                {showMcp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              Generate from your Canvas account user settings.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-800 pt-4 mt-6">
            {!isConfigured ? null : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-800 hover:bg-gray-800 text-gray-300 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-brandBlue to-brandPurple hover:opacity-90 text-white shadow-md shadow-brandBlue/10 transition"
            >
              <Save className="h-4 w-4" /> Save Configuration
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
