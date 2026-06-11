/**
 * ChatModal
 * Interactive AI-powered Capgemini SpeakUp support agent.
 * Props:
 *   open    – boolean
 *   onClose – () => void
 */
import { useEffect, useRef, useState } from 'react'
import { X, Send, RotateCcw, ShieldCheck } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import ChatMessage from './ChatMessage.jsx'
import { LOGO, LOGO_SRC } from '../assets/images.js'

const SUGGESTIONS = [
  "What is Capgemini's code of conduct?",
'How can I report an ethics violation?',
'What is the SpeakUp process?',
'What services does Capgemini offer?'

]

/** Animated typing indicator (three bouncing dots) */
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <img
        src={LOGO_SRC}
        alt=""
        className="w-7 h-7 rounded-full object-contain bg-white border border-gray-200 p-0.5 flex-shrink-0 mt-0.5"
      />
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 inline-block"
            style={{ animation: `bounce-dot 0.7s ${i * 0.15}s ease-in-out infinite alternate` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatModal({ open, onClose }) {
  const { messages, loading, sendMessage, reset } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (text) => {
    setInput('')
    sendMessage(text)
  }

  const handleReset = () => {
    reset()
    setInput('')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="SpeakUp AI Support Agent"
        className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[9999]
                   w-full sm:w-[420px] h-[92vh] sm:h-[640px]
                   bg-white sm:rounded-2xl shadow-2xl
                   flex flex-col overflow-hidden
                   border border-gray-200"
      >

        {/* ── Header ── */}
        <div className="bg-capgemini-darkblue px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <img
            src={LOGO}
            alt="Capgemini"
            className="h-10 object-contain"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[13.5px] leading-tight">
              SpeakUp Support Agent
            </p>
            <p className="text-blue-200 text-[11px]">Confidential &amp; Secure</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Start new conversation"
              className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Confidentiality notice ── */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-start gap-2 flex-shrink-0">
          <ShieldCheck size={14} className="text-capgemini-navy mt-0.5 flex-shrink-0" />
          <p className="text-[11.5px] text-capgemini-navy leading-snug">
            This conversation is confidential. You may remain anonymous.
            For formal reports, use the{' '}
            <a
              href="https://capgemini.integrityline.com/app-page;appPageName=What%20can%20be%20reported"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              Report portal
            </a>.
          </p>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Welcome message (shown when no history) */}
          {messages.length === 0 && (
            <div className="space-y-4">
              {/* Greeting bubble */}
              <div className="flex gap-2 items-start">
                <img
                  src={LOGO_SRC}
                  alt=""
                  className="w-7 h-7 rounded-full object-contain bg-white border border-gray-200 p-0.5 flex-shrink-0 mt-0.5"
                />
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                  <p className="text-[13px] text-gray-800 leading-snug mb-1">
                    Hello! I'm the <strong>SpeakUp Support Agent</strong> for Capgemini.
                  </p>
                  <p className="text-[13px] text-gray-800 leading-snug">
                    I can help you understand the ethics reporting process, what you can report,
                    how confidentiality works, and more. How can I help you today?
                  </p>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="pl-9">
                <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                  Common questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-[12px] text-capgemini-navy border border-capgemini-navy/30
                                 rounded-full px-3 py-1.5 hover:bg-capgemini-navy hover:text-white
                                 transition-colors bg-white leading-none"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversation history */}
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}

          {/* Typing indicator */}
          {loading && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ── */}
        <div className="border-t border-gray-200 px-3 py-3 flex-shrink-0 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3.5 py-2.5
                         text-[13.5px] text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-capgemini-darkblue/40
                         focus:border-capgemini-darkblue disabled:opacity-50
                         leading-snug max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
              onInput={(e) => {
                // Auto-grow textarea
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-capgemini-darkblue
                         flex items-center justify-center text-white
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-capgemini-navy transition-colors"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10.5px] text-gray-400 mt-1.5 text-center">
            Powered by Capgemini · Team Missing Semicolon
          </p>
        </div>

      </div>
    </>
  )
}
