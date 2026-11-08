import Segmented from '@/components/ui/Segmented'
import type { TierScope } from '@/features/tier/types'

type Props = { count?: number; scope: TierScope; onScopeChange: (scope: TierScope) => void }

export default function TierHeader({ count, scope, onScopeChange }: Props) {
  const unit = scope === 'sigungu' ? '시군구' : '행정동'
  return (
    // Figma 195:2235: 제목 30/36 Bold · 설명 16 보조색, 범위 토글은 아래쪽 정렬
    <div className="flex items-end justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-display-3xl text-text-primary">티어리스트</h1>
        <p className="text-body-base text-text-secondary">
          프리셋 종합 점수(워케이션 밸류) 또는 지표 하나로 {count ?? '…'}개 {unit}을 S / A / B / C
          등급으로 봅니다. 등급은 같은 단위 안에서 백분위 사분위.
        </p>
      </div>
      <Segmented
        ariaLabel="범위"
        options={[
          { value: 'sigungu', label: '시군구' },
          { value: 'dong', label: '행정동' },
        ]}
        value={scope}
        onChange={onScopeChange}
      />
    </div>
  )
}
