import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'

type Props = {
  open: boolean
  onClose: () => void
  /** 제목 요소의 id (aria-labelledby) */
  titleId: string
  children: ReactNode
  /** sm 440px (로그인), md 640px (동 추가) */
  width?: 'sm' | 'md'
}

/** 공통 모달. 스크림(scrim 토큰) 위 가운데, 포커스 트랩, Esc·스크림 클릭 닫기, body 스크롤 잠금 */
export default function Modal({ open, onClose, titleId, children, width = 'md' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      data-testid="modal-scrim"
      className="bg-scrim/50 fixed inset-0 z-50 flex items-center justify-center py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`bg-bg-surface shadow-float max-h-full overflow-y-auto rounded-2xl p-6 ${width === 'sm' ? 'w-modal-sm' : 'w-modal-md'}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
