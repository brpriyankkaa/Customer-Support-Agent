import { useState } from 'react'
import { submitTicketFeedback, submitTicketFeedbackSkip } from '../services/api.js'

const FEEDBACK_OPTIONS = [
  { rating: 1, label: 'Very Bad', emoji: '😡' },
  { rating: 2, label: 'Bad', emoji: '🙁' },
  { rating: 3, label: 'Average', emoji: '😐' },
  { rating: 4, label: 'Good', emoji: '🙂' },
  { rating: 5, label: 'Excellent', emoji: '🤩' },
]

export default function FeedbackSection({ ticketId, onSubmitted, alreadySubmitted, onSkip }) {
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  async function handleSelect(option) {
    if (submitting || alreadySubmitted) return
    setSelected(option.label)
    setSubmitting(true)
    setError(null)
    try {
      await submitTicketFeedback(ticketId, option.rating, option.label, option.emoji)
      onSubmitted?.()
    } catch (err) {
      console.error('Feedback submission failed:', err)
      setError('Unable to submit feedback. Please try again.')
      setSelected(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (alreadySubmitted) {
    return null
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm max-w-[86%] mx-auto">
      <p className="text-[13px] font-semibold text-slate-800 text-center mb-3">How was your support experience?</p>
      <div className="flex justify-between gap-2 mb-2">
        {FEEDBACK_OPTIONS.map((option) => (
          <button
            key={option.label}
            onClick={() => handleSelect(option)}
            disabled={submitting}
            aria-pressed={selected === option.label}
            className={`flex-1 flex flex-col items-center gap-1 rounded-lg px-3 py-2 border transition-colors min-w-0 ${
              selected === option.label
                ? 'border-capgemini-darkblue bg-capgemini-darkblue/10'
                : 'border-gray-200 bg-white hover:border-capgemini-darkblue/40 hover:bg-blue-50'
            } disabled:opacity-50`}
          >
            <span className="text-xl">{option.emoji}</span>
            <span className="text-[12px] text-slate-700 font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={async () => {
            if (submitting) return
            setSubmitting(true)
            setError(null)
            try {
              await submitTicketFeedbackSkip(ticketId)
              onSkip?.()
            } catch (err) {
              console.error('Skip failed', err)
              setError('Unable to skip. Please try again.')
            } finally {
              setSubmitting(false)
            }
          }}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Skip
        </button>
      </div>

      {error && (
        <p className="text-[12px] text-red-600 text-center mt-3">{error}</p>
      )}
    </div>
  )
}
