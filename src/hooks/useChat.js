import { useState, useEffect, useRef, useCallback } from 'react'
import {
  askAgent,
  createConversation,
  fetchConversation,
  fetchConversationMessages,
  resetConversation,
  sendUserMessage,
  getUploadUrl,
} from '../services/api'

const POLL_INTERVAL_MS = 2000

function mapServerMessage(msg) {
  const sender = msg.sender || ''
  let role = 'assistant'
  if (sender === 'customer') role = 'user'
  if (sender === 'system') role = 'system'

  const base = {
    id: msg.message_id || `${msg.timestamp}-${sender}`,
    role,
    content: msg.message || '',
    messageType: msg.message_type || 'text',
    sender,
    timestamp: msg.timestamp,
  }

  if (msg.file) {
    base.file = {
      ...msg.file,
      url: getUploadUrl(msg.file.url),
    }
  }

  return base
}

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [ticketId, setTicketId] = useState(null)
  const [isClosed, setIsClosed] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isEscalated, setIsEscalated] = useState(false)
  const [initError, setInitError] = useState(null)
  const pollRef = useRef(null)
  const lastMessageCountRef = useRef(0)

  const syncFromServer = useCallback(async (convId) => {
    if (!convId) return
    try {
      const conv = await fetchConversation(convId)
      setIsClosed(conv.status === 'CLOSED')
      setTicketId(conv.ticket_id || null)
      setIsEscalated(Boolean(conv.ticket_id))
      setFeedbackSubmitted(Boolean(conv.feedback))

      const serverMessages = await fetchConversationMessages(convId)
      const mapped = serverMessages.map(mapServerMessage)

      if (mapped.length !== lastMessageCountRef.current) {
        lastMessageCountRef.current = mapped.length
        setMessages(mapped)
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
  }, [])

  const initConversation = useCallback(async () => {
    try {
      setInitError(null)
      const conv = await createConversation()
      setConversationId(conv.conversation_id)
      setMessages([])
      setIsClosed(false)
      setFeedbackSubmitted(false)
      setIsEscalated(false)
      setTicketId(null)
      lastMessageCountRef.current = 0
    } catch (err) {
      console.error('Failed to create conversation:', err)
      setInitError('Unable to start conversation. Please try again.')
    }
  }, [])

  useEffect(() => {
    initConversation()
  }, [initConversation])

  useEffect(() => {
    if (!conversationId) return

    syncFromServer(conversationId)

    pollRef.current = setInterval(() => {
      syncFromServer(conversationId)
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [conversationId, syncFromServer])

  async function sendMessage(text) {
    if (!text.trim() || loading || isClosed || !conversationId) return

    const trimmed = text.trim()
    setLoading(true)

  try {
      if (isEscalated) {
        await sendUserMessage(conversationId, trimmed)
        await syncFromServer(conversationId)
      } else {
        const data = await askAgent(trimmed, conversationId)

        if (data.closed) {
          setIsClosed(true)
        }

        if (data.ticket_id) {
          setTicketId(data.ticket_id)
          setIsEscalated(true)
        }

        await syncFromServer(conversationId)
      }
    } catch (err) {
      console.error('Backend API error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'I am unable to connect to the support service right now. Please try again later.',
          messageType: 'text',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!conversationId) {
      await initConversation()
      return null
    }
    try {
      const newConv = await resetConversation(conversationId)
      setConversationId(newConv.conversation_id)
      setMessages([])
      setIsClosed(false)
      setFeedbackSubmitted(false)
      setIsEscalated(false)
      setTicketId(null)
      lastMessageCountRef.current = 0
      return newConv.conversation_id
    } catch (err) {
      console.error('Reset failed:', err)
      await initConversation()
      return null
    }
  }

  function onFeedbackSubmitted() {
    setFeedbackSubmitted(true)
  }

  return {
    messages,
    loading,
    sendMessage,
    reset: handleReset,
    conversationId,
    ticketId,
    isClosed,
    feedbackSubmitted,
    isEscalated,
    initError,
    syncFromServer,
    onFeedbackSubmitted,
  }
}
