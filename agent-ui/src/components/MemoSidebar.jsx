import React, { useState } from 'react'
import { FileText, RefreshCw, ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react'

export default function MemoSidebar({ isOpen, toggleOpen, memos, onRefresh }) {
  const [selectedMemo, setSelectedMemo] = useState(null)

  return (
    <div className={`relative flex h-full border-l border-gray-800 bg-[#161B22] transition-all duration-300 ${isOpen ? 'w-80' : 'w-0'}`}>
      
      {/* Toggle Tab */}
      <button
        onClick={toggleOpen}
        className="absolute left-[-24px] top-4 flex h-6 w-6 items-center justify-center rounded-l-md border border-r-0 border-gray-800 bg-[#161B22] text-gray-400 hover:text-white shadow-md transition"
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Sidebar Content */}
      {isOpen && (
        <div className="flex flex-col h-full w-full overflow-hidden p-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <div className="flex items-center space-x-1.5">
              <FileText className="h-4 w-4 text-brandPurple" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Postgres Memos</h4>
            </div>
            <button
              onClick={onRefresh}
              className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
              title="Refresh Memo List"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List of Memos */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {memos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl p-4">
                <FileText className="h-8 w-8 text-gray-600 mb-2" />
                <p className="text-xs">No memos created yet.</p>
                <p className="text-[10px] text-gray-600 mt-1">Ask the agent to create memos using "write_memo" tool!</p>
              </div>
            ) : (
              memos.map((memo) => (
                <div
                  key={memo.id}
                  onClick={() => setSelectedMemo(memo)}
                  className="group relative cursor-pointer rounded-xl border border-gray-800 bg-[#0D1117] p-3 hover:border-brandPurple/50 hover:bg-[#161B22] transition duration-200"
                >
                  <h5 className="text-xs font-bold text-gray-200 truncate group-hover:text-brandPurple">{memo.title}</h5>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{memo.content}</p>
                  <div className="flex items-center justify-between text-[9px] text-gray-600 mt-2 border-t border-gray-800/50 pt-1.5">
                    <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {new Date(memo.updated_at).toLocaleDateString()}</span>
                    <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-brandBlue transition duration-200"><Eye className="h-2.5 w-2.5" /> View</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View Memo Details Modal */}
      {selectedMemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#161B22] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-brandPurple flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Memo: {selectedMemo.title}
              </h4>
              <button
                onClick={() => setSelectedMemo(null)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white transition"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto bg-[#0D1117] p-4 rounded-xl border border-gray-800 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {selectedMemo.content}
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-gray-800">
              <button
                onClick={() => setSelectedMemo(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 text-white hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
