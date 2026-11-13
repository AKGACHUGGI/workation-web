import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { ASK_MAX, EXPLORE_COPY } from '@/features/explore/copy'

type Props = { disabled: boolean; onSend: (question: string) => void }

/**
 * ② 물어보기 입력 + 보내기 (Figma Input 444:9859). 100자에서 더 입력되지 않고 글자 수를 보인다.
 * Enter 로 보내고, 한글 조합 중 Enter(isComposing, Safari keyCode 229)는 무시한다 (물어보기 스펙 §3).
 * 대기 중에는 칸 전체를 흐리게(Figma 444:9891 opacity 0.4). 포커스는 입력 칸 테두리로 보인다
 * (전역 :focus-visible 외곽선이 칸 안에 상자로 겹쳐 input 에서만 끈다)
 */
export default function AskInput({ disabled, onSend }: Props) {
  const [value, setValue] = useState('')
  const canSend = !disabled && value.trim().length > 0
  const send = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }
  return (
    <div className={`flex h-10 shrink-0 gap-2 ${disabled ? 'opacity-40' : ''}`}>
      <div className="border-border-default bg-bg-surface focus-within:border-text-primary flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3">
        <input
          aria-label={EXPLORE_COPY.askLabel}
          placeholder={EXPLORE_COPY.askPlaceholder}
          maxLength={ASK_MAX}
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
            {EXPLORE_COPY.askCount(value.length)}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label={EXPLORE_COPY.askSend}
        disabled={!canSend}
        onClick={send}
        className="bg-bg-inverse text-text-inverse flex size-10 shrink-0 items-center justify-center rounded-lg disabled:cursor-not-allowed"
      >
        <ArrowUp aria-hidden className="size-4" />
      </button>
    </div>
  )
}
