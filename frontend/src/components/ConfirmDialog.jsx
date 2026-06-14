export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Yes', cancelLabel = 'No' }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[10000]" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
          )}
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-capgemini-darkblue px-4 py-2.5 text-sm font-semibold text-white hover:bg-capgemini-navy transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
