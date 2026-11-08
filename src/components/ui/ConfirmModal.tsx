import Modal from '@/components/ui/Modal'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  /** 삭제처럼 되돌릴 수 없는 동작이면 확인 버튼을 경고색으로 */
  danger?: boolean
  /** 요청 진행 중: 두 버튼 비활성 */
  pending?: boolean
}

/** 확인 1단계 모달. W-05 Modal 위에 제목·설명·버튼 2개 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  danger = false,
  pending = false,
}: Props) {
  const confirmTone = danger
    ? 'bg-signal-avoid text-text-inverse hover:bg-error-500'
    : 'bg-brand-primary text-text-inverse hover:bg-brand-hover'
  return (
    <Modal open={open} onClose={onCancel} titleId="confirm-modal-title" width="sm">
      <div className="flex flex-col gap-4">
        <h2 id="confirm-modal-title" className="text-heading-lg text-text-primary">
          {title}
        </h2>
        <p className="text-body-sm text-text-secondary">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="border-border-default text-body-sm text-text-primary disabled:opacity-dim rounded-lg border px-4 py-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`text-body-sm disabled:opacity-dim rounded-lg px-4 py-2 font-medium ${confirmTone}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
