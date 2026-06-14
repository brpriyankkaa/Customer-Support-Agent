/**
 * ActionGrid
 * 3 rows × 2 columns matching capgemini.integrityline.com.
 *
 * Row 1 – blue: Submit an alert | Call Us
 * Row 2 – white: What can be reported? | SpeakUp Policy
 * Row 3 – white | disabled: Check status | Ask a question (coming soon → opens chat)
 *
 * Props:
 *   onAskQuestion – callback to open the AI chat modal
 */
import {
  Megaphone,
  Mic,
  Eye,
  FileText,
  MailCheck,
  HelpCircle,
} from 'lucide-react'
import ActionCard from './ActionCard.jsx'

export default function ActionGrid({ onAskQuestion }) {
  const ROW_CLS = 'grid grid-cols-2 border-t border-capgemini-border'

  return (
    <div className="border border-t-0 border-capgemini-border">

      {/* Row 1 – primary blue actions */}
      <div className={ROW_CLS} style={{ borderTop: 'none' }}>
        <ActionCard
          icon={Megaphone}
          label="Submit an alert"
          variant="blue"
          onClick={() => window.open('https://capgemini.integrityline.com/wb/133590044', '_blank')}
        />
        <ActionCard
          icon={Mic}
          label="Call Us"
          variant="blue"
          onClick={() => window.open('https://capgemini.integrityline.com/app-page;appPageName=Phone%20Numbers', '_blank')}
        />
      </div>

      {/* Row 2 – secondary white actions */}
      <div className={ROW_CLS}>
        <ActionCard
          icon={Eye}
          label="What can be reported?"
          variant="white"
          onClick={() => window.open('https://capgemini.integrityline.com/app-page;appPageName=What%20can%20be%20reported', '_blank')}
        />
        <ActionCard
          icon={FileText}
          label="SpeakUp Policy"
          variant="white"
          onClick={() => window.open('https://capgemini.integrityline.com', '_blank')}
        />
      </div>

      {/* Row 3 – status check + ask a question (opens AI chat) */}
      <div className={ROW_CLS}>
        <ActionCard
          icon={MailCheck}
          label="Check the status of your alert"
          variant="white"
          onClick={() => window.open('https://www.capgemini.com/about-us/who-we-are/values-and-ethics/speakingup/', '_blank')}
        />
        <ActionCard
          icon={HelpCircle}
          label="Ask a question"
          subLabel={null}
          variant="white"
          onClick={onAskQuestion}
        />
      </div>

    </div>
  )
}
