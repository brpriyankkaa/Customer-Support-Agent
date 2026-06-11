/**
 * useChat
 * Manages chat message state and calls the Anthropic API
 * (claude-sonnet-4-20250514) as a Capgemini SpeakUp support agent.
 *
 * Returns:
 *   messages   – array of { role: 'user'|'assistant', content: string }
 *   loading    – boolean, true while streaming/awaiting
 *   sendMessage – (text: string) => Promise<void>
 *   reset      – () => void  clears history
 */
import { useState } from 'react'

const SYSTEM_PROMPT = `You are a helpful, confidential support agent for Capgemini's SpeakUp Ethics Helpline, powered by EQS Integrity Line.

Your role is to:
- Help employees, contractors, suppliers and other stakeholders understand the SpeakUp process
- Explain what types of concerns can be reported (ethics violations, fraud, harassment, bribery, discrimination, safety issues, data privacy breaches, conflicts of interest, and more)
- Guide users through the reporting process step by step
- Reassure users about confidentiality and anonymity protections
- Explain what happens after a report is submitted (investigation process, timelines, follow-up)
- Clarify who manages investigations (Group Ethics function, General Counsels, Ethics & Compliance Officers, HR investigators)
- Answer questions about the SpeakUp Policy

Key facts to remember:
- SpeakUp is voluntary, confidential, and allows anonymity
- Available to internal staff (employees, agency staff, freelancers, subcontractors, trainees) AND external parties (clients, suppliers, business partners, job applicants, shareholders)
- Managed by Capgemini's Group Ethics function
- Licensed from EQS Group (independent third party) for impartiality
- Reports can be submitted via web or phone
- Capgemini has been recognized as a World's Most Ethical Company by Ethisphere for 13 consecutive years

IMPORTANT:
- Never pressure users to report – reporting is always voluntary
- Never ask for identifying information
- Always emphasise confidentiality and anonymity protections
- If someone seems in distress, be empathetic and supportive
- Do not fabricate specific phone numbers or URLs – direct users to the SpeakUp portal at capgemini.integrityline.com
- Keep responses concise and reassuring
- Format your responses using simple markdown (bold for key terms, bullet points for lists)

Respond in the same language the user writes in.`

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)

  async function sendMessage(text) {
    if (!text.trim() || loading) return

    // Optimistically append user message
    const userMsg = { role: 'user', content: text.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: nextMessages,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error ${response.status}`)
      }

      const data = await response.json()
      const assistantText = data.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantText },
      ])
    } catch (err) {
      console.error('Chat API error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm sorry, I'm unable to connect right now. Please try again, or contact the SpeakUp helpline directly at [capgemini.integrityline.com](https://capgemini.integrityline.com).",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([])
  }

  return { messages, loading, sendMessage, reset }
}
