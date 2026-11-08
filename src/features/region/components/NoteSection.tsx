import { useState } from 'react'
import TipCard from '@/features/region/components/TipCard'
import TipComposer from '@/features/region/components/TipComposer'
import type { NotesResponse } from '@/features/region/types'

const INITIAL = 3
const STEP = 10

type Props = {
  title: string
  caption: string
  data?: NotesResponse
  status: 'pending' | 'error' | 'success'
  onRetry: () => void
}

/** 워케이션 노트 (읽기). 처음 3개, 더 보기로 10개씩. W-04 재사용 */
export default function NoteSection({ title, caption, data, status, onRetry }: Props) {
  const [shown, setShown] = useState(INITIAL)
  const items = data?.items ?? []
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">{title}</h2>
        <span className="text-caption-xs text-text-tertiary">{caption}</span>
      </div>
      <div className="flex flex-col gap-3">
        <TipComposer placeholder="이 지역에서 일해본 팁을 남겨주세요" />
        {status === 'pending' && <div className="bg-bg-subtle h-24 animate-pulse rounded-2xl" />}
        {status === 'error' && (
          <p className="text-body-sm text-text-secondary">
            불러오지 못했습니다{' '}
            <button type="button" onClick={onRetry} className="underline">
              다시 시도
            </button>
          </p>
        )}
        {status === 'success' && items.length === 0 && (
          <p className="text-body-sm text-text-tertiary py-6 text-center">
            아직 남겨진 팁이 없어요. 첫 팁을 남겨보세요
          </p>
        )}
        {items.slice(0, shown).map((n) => (
          <TipCard key={n.id} note={n} />
        ))}
        {items.length > shown && (
          <button
            type="button"
            onClick={() => setShown((s) => s + STEP)}
            className="text-body-sm text-text-primary underline"
          >
            더 보기
          </button>
        )}
      </div>
    </section>
  )
}
