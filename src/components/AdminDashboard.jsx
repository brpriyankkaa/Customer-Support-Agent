import { useEffect, useState } from 'react'
import { X, CheckCircle2, UserPlus, MessageSquare, Trash2 } from 'lucide-react'
import { fetchTickets, fetchTicketMessages, takeoverTicket, replyTicket, closeTicket } from '../services/api.js'

export default function AdminDashboard({ onClose }) {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.ticket_id)
    }
  }, [selectedTicket])

  async function loadTickets() {
    setLoading(true)
    try {
      const data = await fetchTickets()
      setTickets(data || [])
    } catch (error) {
      console.error('Unable to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(ticketId) {
    try {
      const data = await fetchTicketMessages(ticketId)
      setMessages(data || [])
    } catch (error) {
      console.error('Unable to load ticket messages:', error)
      setMessages([])
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
      await replyTicket(ticketId, 'Agent', replyText.trim())
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

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-[1120px] h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between gap-3 bg-capgemini-darkblue px-5 py-4 text-white">
          <div>
            <h2 className="text-lg font-semibold">Admin Ticket Dashboard</h2>
            <p className="text-sm text-blue-100">Review escalations, take over chats, and respond to open tickets.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
            aria-label="Close admin dashboard"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] h-full">
          <div className="border-r border-gray-200 overflow-y-auto bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Tickets</h3>
              <span className="text-xs text-slate-400">{tickets.length} total</span>
            </div>
            {loading && <p className="text-sm text-slate-500">Loading tickets...</p>}
            {!loading && tickets.length === 0 && (
              <p className="text-sm text-slate-500">No tickets found.</p>
            )}
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.ticket_id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left rounded-3xl border px-4 py-4 bg-white transition-shadow hover:shadow-sm ${
                    selectedTicket?.ticket_id === ticket.ticket_id ? 'border-capgemini-darkblue shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{ticket.ticket_id}</p>
                      <p className="mt-1 text-xs text-slate-500">{ticket.summary || ticket.customer_query}</p>
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

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-white">
              <div>
                <p className="text-sm text-slate-500">Selected ticket</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedTicket ? selectedTicket.ticket_id : 'Select a ticket to inspect'}
                </h3>
              </div>
              {selectedTicket && (
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
                    <Trash2 size={16} /> Close
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden bg-slate-50">
              {!selectedTicket && (
                <div className="h-full flex items-center justify-center p-10 text-slate-500">
                  <div className="max-w-sm text-center">
                    <MessageSquare size={36} className="mx-auto text-capgemini-darkblue mb-4" />
                    <p className="text-sm">Pick a ticket from the left to view messages and response details.</p>
                  </div>
                </div>
              )}

              {selectedTicket && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Customer query</p>
                          <p className="mt-2 text-sm text-slate-900">{selectedTicket.customer_query}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{selectedTicket.priority}</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Messages</p>
                      <div className="mt-4 space-y-3">
                        {messages.length === 0 && (
                          <p className="text-sm text-slate-500">No agent conversation history yet.</p>
                        )}
                        {messages.map((msg, index) => (
                          <div key={index} className={`rounded-3xl p-4 ${msg.sender === 'Agent' ? 'bg-capgemini-darkblue/5 border border-capgemini-darkblue/10' : 'bg-slate-50 border border-slate-200'}`}>
                            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
                              <span>{msg.sender}</span>
                              <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm leading-6 text-slate-800">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 bg-white p-5">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold text-slate-700">Send reply</label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-capgemini-darkblue focus:outline-none"
                        placeholder="Type your message to the customer here..."
                      />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">Agent view only. Replies are saved to the ticket thread.</span>
                        <button
                          onClick={() => handleReply(selectedTicket.ticket_id)}
                          disabled={!replyText.trim() || loading}
                          className="inline-flex items-center gap-2 rounded-full bg-capgemini-darkblue px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 size={16} /> Send reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
