import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { CHAT_COPY, CHAT_MAX } from '@/features/chat/copy'

type Props = { disabled: boolean; onSend: (question: string) => void }

/**
 * ② 채팅 입력 + 보내기 (Figma Explore/Chat/Input 466:9907). 입력은 알약, 보내기는 원형 Rausch
 * (화면의 Rausch 한 곳, 비활성은 연한 Rausch). 100자에서 더 입력되지 않고 글자 수를 보인다.
 * Enter 로 보내고, 한글 조합 중 Enter(isComposing, Safari keyCode 229)는 무시한다.
 * 포커스는 입력 칸 테두리로 보인다(전역 :focus-visible 외곽선이 칸 안에 상자로 겹쳐 input 에서만 끈다)
 */
export default function ChatInput({ disabled, onSend }: Props) {
  const [value, setValue] = useState('')
  const canSend = !disabled && value.trim().length > 0
  const send = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }
  return (
    <div className="flex h-10 shrink-0 gap-2">
      <div
        className={`border-border-default bg-bg-surface focus-within:border-text-primary flex min-w-0 flex-1 items-center gap-2 rounded-full border px-4 ${disabled ? 'opacity-40' : ''}`}
      >
        <input
          aria-label={CHAT_COPY.chatLabel}
          placeholder={CHAT_COPY.chatPlaceholder}
          maxLength={CHAT_MAX}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            send()
          }}
          className="text-caption-xs text-text-primary placeholder:text-text-tertiary min-w-0 flex-1 bg-transparent outline-none! disabled:cursor-not-allowed"
        />
        {value.length > 0 && (
          <span className="text-explore-2xs text-text-tertiary shrink-0 tabular-nums">
            {CHAT_COPY.chatCount(value.length)}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label={CHAT_COPY.chatSend}
        disabled={!canSend}
        onClick={send}
        className="bg-brand-primary hover:bg-brand-hover disabled:bg-rausch-100 text-text-on-brand flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed"
      >
        <ArrowUp aria-hidden className="size-4" />
      </button>
    </div>
  )
}
