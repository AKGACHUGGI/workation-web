import { useState } from 'react'

type Props = {
  initial: string
  onSave: (nickname: string) => Promise<void>
  onCancel: () => void
}

const MIN = 2
const MAX = 12

/** 닉네임 인라인 편집 (2~12자) */
export default function NicknameEditor({ initial, onSave, onCancel }: Props) {
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)
  const trimmed = value.trim()
  const valid = trimmed.length >= MIN && trimmed.length <= MAX

  async function save() {
    if (!valid) return
    setSaving(true)
    try {
      await onSave(trimmed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <input
        aria-label="닉네임"
        value={value}
        maxLength={MAX}
        onChange={(e) => setValue(e.target.value)}
        className="border-border-default text-body-base text-text-primary h-10 rounded-lg border px-3"
      />
      <button
        type="submit"
        disabled={!valid || saving}
        className="bg-brand-primary text-body-sm text-text-inverse hover:bg-brand-hover disabled:opacity-dim rounded-lg px-4 py-2"
      >
        저장
      </button>
      <button type="button" onClick={onCancel} className="text-body-sm text-text-secondary px-2">
        취소
      </button>
      {!valid && <span className="text-caption-xs text-signal-avoid">2~12자로 입력해 주세요</span>}
    </form>
  )
}
