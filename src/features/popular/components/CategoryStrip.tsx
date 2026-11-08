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
    <nav aria-label="카테고리" className="border-border-default flex items-center gap-8 border-b">
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
            className={`text-caption-segment -mb-px flex flex-col items-center gap-1 border-b-2 pb-3 ${
              active
                ? 'border-text-primary text-text-primary'
                : 'text-text-secondary border-transparent'
            } ${decorative ? 'cursor-default' : 'hover:text-text-primary'}`}
          >
            <Icon size={22} aria-hidden />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
