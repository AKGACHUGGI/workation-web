import { ME_COPY } from '@/features/me/copy'

/** 사이드 하단 안내 상자 (Figma W-08 v2: brand-soft 배경) */
export default function SyncNote() {
  return (
    <div className="bg-brand-soft flex flex-col gap-1.5 rounded-xl p-4">
      <p className="text-body-sm text-text-brand font-bold">{ME_COPY.syncTitle}</p>
      <p className="text-caption-xs text-text-secondary">{ME_COPY.syncBody}</p>
    </div>
  )
}
