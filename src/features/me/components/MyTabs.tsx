import { MY_TABS } from '@/features/me/components/tabs'
import type { MyTab } from '@/features/me/components/tabs'

/** 개수는 활동 요약에서 온다. 요약 조회가 실패하면 undefined → 숫자 없이 탭 이름만 */
type Props = { value: MyTab; onChange: (v: MyTab) => void; tipCount?: number; photoCount?: number }

const withCount = (label: string, n?: number) => (n === undefined ? label : `${label} ${n}`)

/**
 * Figma W-08 v2 Tabs: 회색 바탕(bg-subtle) 안에서 선택한 탭만 흰 바탕 + 옅은 그림자.
 * 공통 Segmented(선택 = 잉크 바탕)와 모양이 달라 여기서 그린다. role=tablist/tab 은 Segmented 와 같다.
 */
export default function MyTabs({ value, onChange, tipCount, photoCount }: Props) {
  const label: Record<MyTab, string> = {
    favorites: '내 즐겨찾기',
    tips: withCount('내 팁', tipCount),
    photos: withCount('내 사진', photoCount),
  }
  return (
    <div
      role="tablist"
      aria-label="마이페이지 탭"
      className="bg-bg-subtle flex gap-1 self-start rounded-lg p-1"
    >
      {MY_TABS.map((tab) => {
        const selected = tab === value
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab)}
            className={`text-body-sm rounded-lg px-4 py-2 font-medium whitespace-nowrap ${
              selected
                ? 'bg-bg-surface text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label[tab]}
          </button>
        )
      })}
    </div>
  )
}
