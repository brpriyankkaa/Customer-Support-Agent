/**
 * Navbar
 * Sticky top bar with the real Capgemini logo (embedded JPEG),
 * navigation links, and language selector – matching capgemini.integrityline.com.
 */
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { LOGO_SRC } from '../assets/images.js'

const NAV_LINKS = [
  { label: 'Home',                      href: '#',    active: true  },
  { label: 'Secure Inbox',              href: '#',    active: false },
  { label: 'Leadership, Values & Ethics', href: '#',  active: false },
]

export default function Navbar({ onAdminClick }) {
  const [langOpen, setLangOpen] = useState(false)

  return (
    <nav className="w-full bg-white border-b border-capgemini-border sticky top-0 z-50">
      <div className="max-w-[960px] mx-auto px-4 h-[52px] flex items-center justify-between">

        {/* ── Logo ── */}
        <a href="#" className="flex-shrink-0">
          <img
            src={LOGO_SRC}
            alt="Capgemini"
            className="h-8 w-auto object-contain"
          />
        </a>

        {/* ── Nav links + actions ── */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={[
                  'text-[13px] whitespace-nowrap pb-0.5 transition-colors',
                  link.active
                    ? 'font-semibold text-gray-800 border-b-2 border-gray-700'
                    : 'text-gray-500 hover:text-gray-800',
                ].join(' ')}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            onClick={onAdminClick}
            className="text-[13px] font-semibold text-capgemini-darkblue hover:text-capgemini-navy transition-colors"
          >
            Admin
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer font-sans"
            >
              English <ChevronDown size={13} />
            </button>

            {langOpen && (
              <ul className="absolute right-0 top-full mt-1 bg-white border border-capgemini-border rounded shadow-md text-[13px] min-w-[120px] z-50">
                {['English', 'Français', 'Deutsch', 'Español'].map((lang) => (
                  <li key={lang}>
                    <button
                      onClick={() => setLangOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      {lang}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
