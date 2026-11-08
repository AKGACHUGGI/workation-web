import Chip from '@/components/ui/Chip'
import type { TierItem } from '@/features/tier/types'

type Props = { items: TierItem[]; value: string; onChange: (sgg: string) => void }

/** 행정동 범위 전용: 전체 + 응답에 있는 시군구 (응답 순서) */
export default function SigunguFilter({ items, value, onChange }: Props) {
  const sggs = new Map<string, string>()
  for (const item of items) {
    if (item.sigungu && !sggs.has(item.sigungu.id)) sggs.set(item.sigungu.id, item.sigungu.name)
  }
  return (
    <div role="group" aria-label="시군구 필터" className="flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-text-secondary">시군구</span>
      <Chip selected={value === 'all'} onClick={() => onChange('all')}>
        전체
      </Chip>
      {[...sggs].map(([id, name]) => (
        <Chip key={id} selected={value === id} onClick={() => onChange(id)}>
          {name}
        </Chip>
      ))}
    </div>
  )
}
