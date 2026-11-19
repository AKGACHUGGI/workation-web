import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DetailSection from '@/features/region/components/DetailSection'
import TipCard from '@/features/region/components/TipCard'
import TipComposer from '@/features/region/components/TipComposer'
import type { NoteTarget, NotesResponse } from '@/features/region/types'

const INITIAL = 3
const STEP = 10

type Props = {
  title: string
  caption: string
  data?: NotesResponse
  status: 'pending' | 'error' | 'success'
  onRetry: () => void
}

/** 워케이션 노트 (읽기 · 쓰기). 처음 3개, 더 보기로 10개씩. W-04 재사용 */
export default function NoteSection({ title, caption, data, status, onRetry }: Props) {
  const [shown, setShown] = useState(INITIAL)
  const items = data?.items ?? []
  // 쓰기 대상은 라우트로 정한다: /dongs/:dongId 면 동, /regions/:sggId 면 시군구
  const { sggId, dongId } = useParams()
  const target: NoteTarget = dongId
    ? { kind: 'dongs', id: dongId }
    : { kind: 'regions', id: sggId ?? '' }
  return (
    <DetailSection title={title} caption={caption}>
      <TipComposer placeholder="이 지역에서 알게 된 팁을 남겨보세요" target={target} />
      {status === 'pending' && <div className="bg-bg-subtle h-24 animate-pulse rounded-xl" />}
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
    </DetailSection>
  )
}
