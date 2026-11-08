import { X } from 'lucide-react'

type Props = {
  message: string
  action?: { label: string; onClick: () => void }
  onDismiss: () => void
}

/** 화면 하단 가운데 토스트 1개 */
export default function Toast({ message, action, onDismiss }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-bg-inverse text-text-inverse shadow-float text-body-sm fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg px-4 py-3"
    >
      <span>{message}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick()
            onDismiss()
          }}
          className="text-text-inverse font-bold underline"
        >
          {action.label}
        </button>
      )}
      <button type="button" aria-label="닫기" onClick={onDismiss} className="text-text-inverse">
        <X size={16} />
      </button>
    </div>
  )
}
