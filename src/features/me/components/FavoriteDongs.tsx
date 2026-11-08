import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import DongRow from '@/features/region/components/DongRow'
import type { FavoriteDong } from '@/features/me/types'
import { useRemoveFavoriteWithUndo } from '@/features/me/useRemoveFavoriteWithUndo'
import { metricGrade } from '@/features/metric/score'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = { dongs: FavoriteDong[] }
const MAX_COMPARE = 3

export default function FavoriteDongs({ dongs }: Props) {
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const remove = useRemoveFavoriteWithUndo()
  const compareHref = useCarryLink(`/compare?dongs=${selected.join(',')}`)
  const dongBase = useCarryLink('/dongs')
  const canCompare = selected.length >= 2

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">즐겨찾기 동네 {dongs.length}곳</h2>
        <div className="flex items-center gap-2">
          {selecting ? (
            <>
              <span className="text-caption-xs text-text-tertiary">
                {selected.length}/{MAX_COMPARE} 선택
              </span>
              {canCompare ? (
                <Link
                  to={compareHref}
                  className="bg-brand-primary text-body-sm text-text-inverse rounded-lg px-4 py-2"
                >
                  비교하기
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="bg-brand-primary text-body-sm text-text-inverse opacity-dim rounded-lg px-4 py-2"
                >
                  비교하기
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelecting(false)
                  setSelected([])
                }}
                className="text-body-sm text-text-secondary px-2"
              >
                취소
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelecting(true)}
              disabled={dongs.length < 2}
              className="border-border-default text-body-sm text-text-primary disabled:opacity-dim rounded-lg border px-4 py-2"
            >
              선택해서 비교
            </button>
          )}
        </div>
      </div>
      <ul className="border-border-default rounded-xl border px-4">
        {dongs.map((d) => {
          const checked = selected.includes(d.id)
          const full = !checked && selected.length >= MAX_COMPARE
          return (
            <DongRow
              key={d.id}
              name={d.name}
              kind={d.kind}
              subtitle={`${d.sigungu.name} · 저녁 활기 ${metricGrade(d.scores.vibe)} · 또래 ${metricGrade(d.scores.peer)}`}
              gradeLabel="동네 조용함"
              grade={metricGrade(d.scores.quiet)}
              href={dongBase.replace('/dongs', `/dongs/${d.id}`)}
              leading={
                selecting ? (
                  <input
                    type="checkbox"
                    aria-label={d.name}
                    checked={checked}
                    disabled={full}
                    onChange={() => toggleSelect(d.id)}
                    className="accent-selected-bg h-4 w-4"
                  />
                ) : (
                  <button
                    type="button"
                    aria-label={`${d.name} 즐겨찾기 해제`}
                    onClick={() => remove('dongs', d.id, d.name)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                  >
                    <Heart size={16} aria-hidden className="fill-accent-save text-accent-save" />
                  </button>
                )
              }
            />
          )
        })}
      </ul>
    </section>
  )
}
