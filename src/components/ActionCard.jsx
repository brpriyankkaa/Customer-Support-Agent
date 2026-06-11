/**
 * ActionCard
 * A single cell in the 2-column action grid.
 *
 * Props:
 *   icon       – Lucide React icon component
 *   label      – main text
 *   subLabel   – secondary text (e.g. "coming soon")
 *   variant    – "blue" | "white" | "disabled"
 *   onClick    – click handler (ignored when disabled)
 */
export default function ActionCard({ icon: Icon, label, subLabel, variant = 'white', onClick }) {
  const isBlue     = variant === 'blue'
  const isDisabled = variant === 'disabled'

  const containerCls = [
    'flex flex-col items-center justify-center py-10 px-5 min-h-[145px]',
    'border-r border-capgemini-border last:border-r-0',
    'transition-opacity duration-150',
    isBlue     ? 'bg-capgemini-darkblue' : '',
    isDisabled ? 'bg-capgemini-disabled cursor-default' : '',
    !isBlue && !isDisabled ? 'bg-white' : '',
    !isDisabled ? 'cursor-pointer hover:opacity-90' : '',
  ].join(' ')

  const iconCls = [
    'mb-4',
    isBlue     ? 'text-white'  : '',
    isDisabled ? 'text-[#888]' : '',
    !isBlue && !isDisabled ? 'text-gray-800' : '',
  ].join(' ')

  const labelCls = [
    'font-bold text-[13px] text-center leading-snug',
    isBlue     ? 'text-white'  : '',
    isDisabled ? 'text-[#888]' : '',
    !isBlue && !isDisabled ? 'text-gray-900' : '',
  ].join(' ')

  return (
    <button
      className={containerCls}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      <Icon size={36} strokeWidth={1.5} className={iconCls} />
      <span className={labelCls}>{label}</span>
      {subLabel && (
        <span className="text-[11.5px] text-[#aaa] mt-1">{subLabel}</span>
      )}
    </button>
  )
}
