/**
 * ChatModal
 * Interactive AI-powered Capgemini SpeakUp support agent.
 */
import { useEffect, useRef, useState } from 'react'
import { X, Send, RotateCcw, ShieldCheck, Paperclip, Loader2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import ChatMessage from './ChatMessage.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import FeedbackSection from './FeedbackSection.jsx'
import { LOGO, LOGO_SRC } from '../assets/images.js'
import { uploadChatFile } from '../services/api.js'

const SUGGESTIONS = [
  "What is Capgemini's code of conduct?",
  'How can I report an ethics violation?',
  'What is the SpeakUp process?',
  'What services does Capgemini offer?',
]

const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.pdf,.txt'

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
  const {
    messages,
    loading,
    sendMessage,
    reset,
    conversationId,
    isClosed,
    feedbackSubmitted,
    isEscalated,
    initError,
    onFeedbackSubmitted,
    syncFromServer,
    ticketId,
  } = useChat()

  const [input, setInput] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isClosed, feedbackSubmitted])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading || isClosed) return
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
    if (isClosed) return
    setInput('')
    sendMessage(text)
  }

  const handleResetClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmReset = async () => {
    setShowConfirm(false)
    setInput('')
    await reset()
  }

  function handleFeedbackSubmitted() {
    onFeedbackSubmitted?.()
  }

  function handleFeedbackSkip() {
    onFeedbackSubmitted?.()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !conversationId || isClosed) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowed = ['png', 'jpg', 'jpeg', 'pdf', 'txt']
    if (!allowed.includes(ext)) {
      alert('Only png, jpg, jpeg, pdf, and txt files are allowed.')
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      await uploadChatFile(conversationId, file)
      await syncFromServer(conversationId)
    } catch (err) {
      console.error('File upload failed:', err)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (!open) return null

  const inputDisabled = loading || isClosed || uploading

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

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
        <div className="bg-capgemini-darkblue px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <img src={LOGO} alt="Capgemini" className="h-10 object-contain" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[13.5px] leading-tight">
              SpeakUp Support Agent
            </p>
            <p className="text-blue-200 text-[11px]">
              {isEscalated ? 'Connected to human support' : 'Confidential & Secure'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleResetClick}
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

        {initError && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-2">
            <p className="text-[12px] text-red-700">{initError}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="space-y-4">
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

              {!isClosed && (
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
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              <ChatMessage
                role={msg.role}
                content={msg.content}
                messageType={msg.messageType}
                file={msg.file}
                sender={msg.sender}
              />

              {/* Inline feedback prompt inserted by backend when message_type === 'feedback_prompt' */}
              {msg.messageType === 'feedback_prompt' && (
                <div className="mt-2">
                  <FeedbackSection
                    ticketId={ticketId}
                    onSubmitted={handleFeedbackSubmitted}
                    alreadySubmitted={feedbackSubmitted}
                    onSkip={handleFeedbackSkip}
                  />
                </div>
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 px-3 py-3 flex-shrink-0 bg-white">
          {isClosed ? (
            <p className="text-center text-[12px] text-slate-500 py-2">
              This conversation has been closed. Start a new session to continue.
            </p>
          ) : (
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={inputDisabled}
                className="flex-shrink-0 w-10 h-10 rounded-xl border border-gray-300
                           flex items-center justify-center text-slate-500
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Upload file"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className="hidden"
                onChange={handleFileSelect}
                disabled={inputDisabled}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEscalated ? 'Message support agent…' : 'Type your question…'}
                rows={1}
                disabled={inputDisabled}
                className="flex-1 resize-none rounded-xl border border-gray-300 px-3.5 py-2.5
                           text-[13.5px] text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-capgemini-darkblue/40
                           focus:border-capgemini-darkblue disabled:opacity-50
                           leading-snug max-h-32 overflow-y-auto"
                style={{ minHeight: '42px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || inputDisabled}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-capgemini-darkblue
                           flex items-center justify-center text-white
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:bg-capgemini-navy transition-colors"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          )}
          <p className="text-[10.5px] text-gray-400 mt-1.5 text-center">
            Powered by Capgemini · Team Missing Semicolon
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Clear Conversation?"
        message={"Are you sure you want to clear this conversation?\n\nThis action cannot be undone."}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Yes, Clear"
        cancelLabel="Cancel"
      />
    </>
  )
}
