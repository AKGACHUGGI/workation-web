import { CATEGORIES } from '@/features/popular/categories'
import type { CategoryFilter } from '@/features/popular/categories'
import { usePlaceParam, useTerrainParam } from '@/features/popular/useTerrainParam'

const toggle = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter((t) => t !== v) : [...list, v]

/** 장소 태그 필터 (복수 토글, 고른 것 중 하나라도 있으면 통과). 활성 상태는 URL 에서 유도. */
export default function CategoryStrip() {
  const [terrain, setTerrain] = useTerrainParam()
  const [place, setPlace] = usePlaceParam()

  const isActive = (f: CategoryFilter) =>
    f.kind === 'terrain' ? terrain.includes(f.value) : place.includes(f.value)

  const act = (f: CategoryFilter) => {
    if (f.kind === 'terrain') setTerrain(toggle(terrain, f.value))
    else setPlace(toggle(place, f.value))
  }

  return (
    // Figma CategoryStrip(274:4714): 가운데 정렬 · 아이콘 24 + 라벨 12 + 활성 2px 잉크 밑줄
    <nav aria-label="카테고리" className="flex items-end justify-center gap-7 pt-3">
      {CATEGORIES.map(({ key, label, icon: Icon, filter }) => {
        const active = isActive(filter)
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => act(filter)}
            className={`text-caption-segment hover:text-text-primary flex flex-col items-center gap-1.5 px-1 pt-2 whitespace-nowrap ${
              active ? 'text-text-primary' : 'text-text-secondary'
            }`}
          >
            <Icon size={24} strokeWidth={1.5} aria-hidden />
            {label}
            <span
              aria-hidden
              className={`h-0.5 w-full ${active ? 'bg-text-primary' : 'bg-transparent'}`}
            />
          </button>
        )
      })}
    </nav>
  )
}
