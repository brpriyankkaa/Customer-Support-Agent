import { useState } from 'react'
import { askAgent } from '../services/api'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  async function sendMessage(text) {
    if (!text.trim() || loading) return

    const userMsg = {
      role: 'user',
      content: text.trim(),
    }

    const nextMessages = [...messages, userMsg]

    setMessages(nextMessages)
    setLoading(true)

    try {
      const data = await askAgent(text.trim())

      const assistantText =
        data.answer ||
        data.response ||
        'No response received from the support agent.'

      const escalationNotice =
        data.escalation?.escalate && data.ticket_id
          ? ` Your ticket number is ${data.ticket_id}.`
          : data.escalation?.escalate
          ? ' A human support agent will review your issue and respond shortly.'
          : ''

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${assistantText}${escalationNotice}`,
        },
      ])
    } catch (err) {
      console.error('Backend API error:', err)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I am unable to connect to the support service right now. Please try again later.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([])
  }

  return {
    messages,
    loading,
    sendMessage,
    reset,
  }
}
