type Props = { message: string; actionLabel: string; onAction: () => void }

/** 패널 오류·404 (스펙 §9). 문구 + 버튼 하나 */
export default function PanelMessage({ message, actionLabel, onAction }: Props) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 pt-5">
      <p className="text-body-base text-text-primary font-medium">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="bg-selected-bg text-selected-fg text-body-sm rounded-lg px-4 py-2 font-bold"
      >
        {actionLabel}
      </button>
    </div>
  )
}
