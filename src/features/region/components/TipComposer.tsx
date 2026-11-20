import { useLayoutEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/toast/useToast'
import { useAuth } from '@/features/auth/useAuth'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { NOTE_MAX_LEN, NOTE_PHOTO_MAX } from '@/features/region/types'
import type { NoteTarget } from '@/features/region/types'
import { useCreateNoteMutation } from '@/features/region/useCreateNoteMutation'
import { usePhotoPicker } from '@/features/upload/usePhotoPicker'

type Props = { placeholder: string; target: NoteTarget }

/**
 * 작성 입력 바 (Figma TipComposer 27:175): 회색 바 · '나' 아바타 · 입력 · 카메라 · 등록.
 * 비로그인은 포커스하면 로그인 모달. Cmd/Ctrl+Enter 로도 등록
 */
export default function TipComposer({ placeholder, target }: Props) {
  const { me, isLoggedIn } = useAuth()
  const requireLogin = useRequireLogin()
  const toast = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const { photos, open, remove, clear, inputProps } = usePhotoPicker({
    max: NOTE_PHOTO_MAX,
    onReject: toast.show,
  })
  const mutation = useCreateNoteMutation(target)

  // 자동 높이: 내용만큼 늘리고 max-h 를 넘으면 스크롤
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [body])

  const trimmed = body.trim()
  const canSubmit = trimmed.length > 0 && trimmed.length <= NOTE_MAX_LEN && !mutation.isPending

  const submit = () => {
    if (!canSubmit) return
    // 사진이 있으면 multipart 로 함께 보낸다 (서버가 WebP 로 바꿔 R2 에 올린다)
    const req = { body: trimmed, ...(photos.length && { photos: photos.map((p) => p.file) }) }
    mutation.mutate(req, {
      onSuccess: () => {
        setBody('')
        clear()
        toast.show('팁을 남겼어요')
      },
      onError: () =>
        toast.show(
          photos.length
            ? '팁을 올리지 못했어요. 사진 형식(JPEG·PNG·WebP)과 크기를 확인해 주세요'
            : '팁을 올리지 못했어요. 잠시 후 다시 시도해 주세요',
        ),
    })
  }

  const guard = () => {
    if (!isLoggedIn) requireLogin(() => textareaRef.current?.focus())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-bg-subtle focus-within:bg-bg-surface-strong flex w-full items-end gap-3 rounded-xl py-2.5 pr-2.5 pl-4">
        <Avatar initial={me?.initial ?? '나'} size="sm" className="mb-2" />
        <textarea
          ref={textareaRef}
          rows={1}
          value={body}
          readOnly={!isLoggedIn}
          onFocus={guard}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              submit()
            }
          }}
          maxLength={NOTE_MAX_LEN}
          placeholder={placeholder}
          aria-label="워케이션 팁"
          className="text-body-sm text-text-primary placeholder:text-text-tertiary max-h-40 min-w-0 flex-1 resize-none self-center bg-transparent py-1 outline-none"
        />
        <input {...inputProps} />
        <button
          type="button"
          onClick={() => requireLogin(open)}
          aria-label="사진 추가"
          className="text-text-secondary hover:text-text-primary mb-1.5 shrink-0"
        >
          <Camera size={20} aria-hidden />
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="bg-brand-primary text-body-sm text-text-on-brand shrink-0 rounded-lg px-3 py-2 font-medium disabled:opacity-40"
        >
          등록
        </button>
      </div>
      {photos.length > 0 && (
        <ul className="flex gap-2" aria-label="첨부한 사진">
          {photos.map((p, i) => (
            <li key={p.id} className="relative size-16 shrink-0">
              <img
                src={p.previewUrl}
                alt={`첨부 사진 ${i + 1}`}
                className="size-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`첨부 사진 ${i + 1} 삭제`}
                className="bg-bg-inverse/70 text-text-inverse absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full"
              >
                <X size={12} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
