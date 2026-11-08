import { usePresetParam } from '@/hooks/useQueryState'
import { CATEGORIES } from '@/features/popular/categories'
import type { CategoryAction } from '@/features/popular/categories'
import { useTerrainParam } from '@/features/popular/useTerrainParam'

/** 지형 필터(복수 토글) + 프리셋 바로가기. 활성 상태는 URL 에서 유도. */
export default function CategoryStrip() {
  const [terrain, setTerrain] = useTerrainParam()
  const [preset, setPreset] = usePresetParam()

  const isActive = (a: CategoryAction) =>
    (a.kind === 'terrain' && terrain.includes(a.value)) ||
    (a.kind === 'preset' && preset === a.value)

  const act = (a: CategoryAction) => {
    if (a.kind === 'terrain') {
      setTerrain(
        terrain.includes(a.value) ? terrain.filter((t) => t !== a.value) : [...terrain, a.value],
      )
    } else if (a.kind === 'preset') {
      setPreset(a.value)
    }
  }

  return (
    // Figma CategoryStrip(274:4714): 가운데 정렬 · 간격 36 · 아이콘 24 + 라벨 12 + 활성 2px 잉크 밑줄
    <nav aria-label="카테고리" className="flex items-end justify-center gap-9 pt-3">
      {CATEGORIES.map(({ key, label, icon: Icon, action }) => {
        const active = isActive(action)
        const decorative = action.kind === 'none'
        return (
          <button
            key={key}
            type="button"
            aria-pressed={decorative ? undefined : active}
            aria-disabled={decorative || undefined}
            onClick={decorative ? undefined : () => act(action)}
            className={`text-caption-segment flex flex-col items-center gap-1.5 px-1 pt-2 ${
              active ? 'text-text-primary' : 'text-text-secondary'
            } ${decorative ? 'cursor-default' : 'hover:text-text-primary'}`}
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
