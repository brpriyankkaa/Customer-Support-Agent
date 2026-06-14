import { LOGO_SRC } from '../assets/images.js'
import { FileText, Download } from 'lucide-react'

function boldify(s) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let listItems = []

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 my-1 space-y-0.5">
          {listItems.map((item, i) => (
            <li
              key={i}
              className="text-[13px] leading-snug"
              dangerouslySetInnerHTML={{ __html: boldify(item) }}
            />
          ))}
        </ul>
      )
      listItems = []
    }
  }

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

function FileAttachment({ file }) {
  const isImage = file.mime_type?.startsWith('image/')
  const isPdf = file.mime_type === 'application/pdf'

  if (isImage) {
    return (
      <div className="mt-2">
        <img
          src={file.url}
          alt={file.original_name}
          className="max-w-full rounded-lg border border-gray-200 max-h-48 object-contain"
        />
        <p className="text-[11px] text-gray-500 mt-1">{file.original_name}</p>
      </div>
    )
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-capgemini-navy hover:bg-gray-50"
    >
      {isPdf ? <FileText size={16} /> : <Download size={16} />}
      <span className="truncate">{file.original_name}</span>
    </a>
  )
}

export default function ChatMessage({ role, content, messageType, file, sender }) {
  const isUser = role === 'user'
  const isSystem = role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 max-w-[90%] text-center">
          <p className="text-[12.5px] text-amber-800 leading-snug">{content}</p>
        </div>
      </div>
    )
  }

  const isAgent = !isUser && !isSystem

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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

      <div
        className={[
          'max-w-[82%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-capgemini-darkblue text-white rounded-tr-sm'
            : isAgent
            ? 'bg-blue-50 text-gray-800 rounded-tl-sm border border-blue-100'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm',
        ].join(' ')}
      >
        {isAgent && (
          <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold mb-1">
            Support Agent
          </p>
        )}
        <div className={isUser ? 'text-white' : 'text-gray-800'}>
          {messageType === 'file' && file ? (
            <FileAttachment file={file} />
          ) : (
            renderMarkdown(content)
          )}
        </div>
      </div>
    </div>
  )
}
