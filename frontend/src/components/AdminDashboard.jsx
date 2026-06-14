import { useEffect, useState, useRef } from 'react'
import { X, CheckCircle2, UserPlus, MessageSquare, Send, AlertTriangle } from 'lucide-react'
import {
  fetchTickets,
  fetchTicketMessages,
  takeoverTicket,
  replyTicket,
  closeTicket,
  fetchTrendingIssues,
} from '../services/api.js'
import KnowledgeBaseAdmin from './KnowledgeBaseAdmin.jsx'

const POLL_INTERVAL_MS = 2000

const TABS = [
  { id: 'tickets', label: 'Tickets' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'trending', label: 'Proactive Alerts' },
]

export default function AdminDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('tickets')
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendingIssues, setTrendingIssues] = useState([])
  const pollRef = useRef(null)

  useEffect(() => {
    loadTickets()
    loadTrending()

    pollRef.current = setInterval(() => {
      loadTickets()
      if (selectedTicket) {
        loadMessages(selectedTicket.ticket_id)
      }
      if (activeTab === 'trending') {
        loadTrending()
      }
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedTicket, activeTab])

  async function loadTickets() {
    try {
      const data = await fetchTickets()
      setTickets(data || [])
    } catch (error) {
      console.error('Unable to load tickets:', error)
    }
  }

  async function loadMessages(ticketId) {
    try {
      const data = await fetchTicketMessages(ticketId)
      setMessages(data || [])
    } catch (error) {
      console.error('Unable to load ticket messages:', error)
    }
  }

  async function loadTrending() {
    try {
      const data = await fetchTrendingIssues()
      setTrendingIssues(data || [])
    } catch (error) {
      console.error('Unable to load trending issues:', error)
    }
  }

  async function handleTakeover(ticketId) {
    setLoading(true)
    try {
      await takeoverTicket(ticketId, 'Admin Agent')
      await loadTickets()
      if (selectedTicket?.ticket_id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, owner: 'Admin Agent', status: 'IN_PROGRESS' }))
      }
    } catch (error) {
      console.error('Takeover failed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleReply(ticketId) {
    if (!replyText.trim()) return
    setLoading(true)
    try {
      // Send using the current owner/agent name when available so messages
      // are properly attributed in storage.
      const senderName = selectedTicket?.owner || 'human'
      await replyTicket(ticketId, senderName, replyText.trim())
      setReplyText('')
      await loadMessages(ticketId)
    } catch (error) {
      console.error('Reply failed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleClose(ticketId) {
    setLoading(true)
    try {
      await closeTicket(ticketId)
      await loadTickets()
      if (selectedTicket?.ticket_id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: 'CLOSED' }))
      }
    } catch (error) {
      console.error('Close failed:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleReplyKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedTicket && replyText.trim() && !loading) {
        handleReply(selectedTicket.ticket_id)
      }
    }
  }

  const isTicketClosed = selectedTicket?.status === 'CLOSED'

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-[1120px] h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between gap-3 bg-capgemini-darkblue px-5 py-4 text-white">
          <div>
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-blue-100">
              Manage tickets, knowledge base, and proactive alerts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
            aria-label="Close admin dashboard"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-white px-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-capgemini-darkblue text-capgemini-darkblue'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'knowledge' && (
          <div className="flex-1 overflow-hidden">
            <KnowledgeBaseAdmin />
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-900">Trending Issues</h3>
            </div>
            {trendingIssues.length === 0 && (
              <p className="text-sm text-slate-500">No trending issues above threshold.</p>
            )}
            <div className="space-y-3">
              {trendingIssues.map((issue, index) => (
                <div
                  key={`${issue.issue}-${index}`}
                  className={`rounded-2xl border p-5 bg-white ${
                    issue.severity === 'HIGH' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    ⚠ Trending Issue: {issue.issue}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>Occurrences: {issue.occurrences} Users</span>
                    <span className={issue.severity === 'HIGH' ? 'text-red-600 font-semibold' : ''}>
                      Severity: {issue.severity}
                    </span>
                    <span>Status: {issue.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[360px_1fr] overflow-hidden">
            <div className="border-r border-gray-200 overflow-y-auto bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Tickets</h3>
                <span className="text-xs text-slate-400">{tickets.length} total</span>
              </div>
              {/* Proactive alerts shown above tickets for Admins */}
              {trendingIssues.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Proactive Alerts</h4>
                  <div className="space-y-2">
                    {trendingIssues.map((issue, idx) => (
                      <div key={idx} className="rounded-xl border p-3 bg-white">
                        <p className="text-sm font-semibold">{issue.issue}</p>
                        <div className="text-xs text-slate-500 mt-1">Occurrences: {issue.occurrences} • Severity: {issue.severity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {loading && tickets.length === 0 && (
                <p className="text-sm text-slate-500">Loading tickets...</p>
              )}
              {!loading && tickets.length === 0 && (
                <p className="text-sm text-slate-500">No tickets found.</p>
              )}
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.ticket_id}
                    onClick={() => {
                      setSelectedTicket(ticket)
                      loadMessages(ticket.ticket_id)
                    }}
                    className={`w-full text-left rounded-3xl border px-4 py-4 bg-white transition-shadow hover:shadow-sm ${
                      selectedTicket?.ticket_id === ticket.ticket_id
                        ? 'border-capgemini-darkblue shadow-sm'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ticket.ticket_id}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {ticket.summary || ticket.customer_query}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white ${
                          ticket.status === 'OPEN'
                            ? 'bg-emerald-600'
                            : ticket.status === 'IN_PROGRESS'
                            ? 'bg-amber-600'
                            : 'bg-slate-500'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                      <span>{ticket.assigned_team}</span>
                      <span>{ticket.owner}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-white">
                <div>
                  <p className="text-sm text-slate-500">Selected ticket</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">
                    {selectedTicket ? selectedTicket.ticket_id : 'Select a ticket to inspect'}
                  </h3>
                </div>
                {selectedTicket && !isTicketClosed && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTakeover(selectedTicket.ticket_id)}
                      className="inline-flex items-center gap-2 rounded-full bg-capgemini-darkblue px-4 py-2 text-sm font-semibold text-white hover:bg-capgemini-navy transition"
                    >
                      <UserPlus size={16} /> Take over
                    </button>
                    <button
                      onClick={() => handleClose(selectedTicket.ticket_id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden bg-slate-50">
                {!selectedTicket && (
                  <div className="h-full flex items-center justify-center p-10 text-slate-500">
                    <div className="max-w-sm text-center">
                      <MessageSquare size={36} className="mx-auto text-capgemini-darkblue mb-4" />
                      <p className="text-sm">
                        Pick a ticket from the left to view messages and respond to customers.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTicket && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Customer query
                            </p>
                            <p className="mt-2 text-sm text-slate-900">
                              {selectedTicket.customer_query}
                            </p>
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                            {selectedTicket.priority}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Conversation
                        </p>
                        <div className="mt-4 space-y-3">
                          {messages.length === 0 && (
                            <p className="text-sm text-slate-500">No messages yet.</p>
                          )}
                          {messages.map((msg, index) => (
                            <div
                              key={msg.message_id || index}
                              className={`rounded-3xl p-4 ${
                                msg.sender === 'system'
                                  ? 'bg-amber-50 border border-amber-200 text-center'
                                  : msg.sender === 'customer'
                                  ? 'bg-slate-50 border border-slate-200'
                                  : 'bg-capgemini-darkblue/5 border border-capgemini-darkblue/10'
                              }`}
                            >
                              {msg.sender !== 'system' && (
                                <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
                                  <span>{msg.sender}</span>
                                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                              )}
                              <p className="text-sm leading-6 text-slate-800">{msg.message}</p>
                              {msg.file && (
                                <p className="text-xs text-slate-500 mt-1">
                                  File: {msg.file.original_name}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!isTicketClosed && (
                      <div className="border-t border-gray-200 bg-white p-5">
                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-semibold text-slate-700">Send reply</label>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={handleReplyKeyDown}
                            rows={3}
                            className="w-full resize-none rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-capgemini-darkblue focus:outline-none"
                            placeholder="Type your message to the customer here... (Press Enter to send)"
                          />
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              Press Enter to send. Customer sees replies in real time.
                            </span>
                            <button
                              onClick={() => handleReply(selectedTicket.ticket_id)}
                              disabled={!replyText.trim() || loading}
                              className="inline-flex items-center gap-2 rounded-full bg-capgemini-darkblue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-capgemini-navy transition"
                            >
                              <Send size={16} /> Send
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isTicketClosed && (
                      <div className="border-t border-gray-200 bg-amber-50 px-6 py-4">
                        <p className="text-sm text-amber-800 text-center">
                          This ticket has been closed. Conversation is disabled.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
