import { X } from 'lucide-react'

type Props = {
  message: string
  action?: { label: string; onClick: () => void }
  onDismiss: () => void
  /** 닫히는 중: 아래로 빠지는 애니메이션을 틀고, 끝나면 onLeft 로 치운다 */
  leaving?: boolean
  onLeft?: () => void
}

/** 화면 하단 가운데 토스트 1개. 아래에서 스프링으로 올라오고 닫히면 아래로 빠진다 */
export default function Toast({ message, action, onDismiss, leaving = false, onLeft }: Props) {
  return (
    <div
      // 빠지는 동안은 이미 닫힌 토스트다: 다시 읽히거나 눌리지 않게 status 를 떼고 클릭을 막는다
      role={leaving ? undefined : 'status'}
      aria-live={leaving ? undefined : 'polite'}
      aria-hidden={leaving || undefined}
      onAnimationEnd={(e) => {
        if (leaving && e.target === e.currentTarget) onLeft?.()
      }}
      className={`bg-bg-inverse text-text-inverse shadow-float text-body-sm fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg px-4 py-3 ${
        leaving ? 'animate-toast-out pointer-events-none' : 'animate-toast-in'
      }`}
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
