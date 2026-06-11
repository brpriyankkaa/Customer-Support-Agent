/**
 * ChatMessage
 * Renders a single chat bubble.
 
 */
import { LOGO } from '../assets/images.js'

/** Very lightweight markdown → JSX (no external dependency needed) */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let listItems = []

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 my-1 space-y-0.5">
          {listItems.map((item, i) => (
            <li key={i} className="text-[13px] leading-snug"
              dangerouslySetInnerHTML={{ __html: boldify(item) }}
            />
          ))}
        </ul>
      )
      listItems = []
    }
  }

  const boldify = (s) =>
    s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  lines.forEach((line, i) => {
    if (/^[-•]\s+/.test(line)) {
      listItems.push(line.replace(/^[-•]\s+/, ''))
    } else {
      flushList()
      if (line.trim()) {
        elements.push(
          <p
            key={i}
            className="text-[13px] leading-snug mb-1 last:mb-0"
            dangerouslySetInnerHTML={{ __html: boldify(line) }}
          />
        )
      }
    }
  })
  flushList()
  return elements
}

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-full bg-capgemini-darkblue flex items-center justify-center text-white text-[11px] font-bold">
            You
          </div>
        ) : (
          <img
            src={LOGO_SRC}
            alt="SpeakUp Agent"
            className="w-7 h-7 rounded-full object-contain bg-white border border-gray-200 p-0.5"
          />
        )}
      </div>

      {/* Bubble */}
      <div
        className={[
          'max-w-[82%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-capgemini-darkblue text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm',
        ].join(' ')}
      >
        <div className={isUser ? 'text-white' : 'text-gray-800'}>
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  )
}
