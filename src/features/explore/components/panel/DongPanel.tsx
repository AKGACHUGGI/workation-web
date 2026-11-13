import { useState } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DayGroup, DetailKind, DongDetail, SimilarDong } from '@/features/explore/types'
import { useDelayedLoading } from '@/features/explore/useDelayedLoading'
import { useDongQuery } from '@/features/explore/useDongQuery'
import { NotFoundError } from '@/lib/errors'
import Briefing from '@/features/explore/components/panel/Briefing'
import DetailSlot from '@/features/explore/components/panel/DetailSlot'
import DongFactGraph from '@/features/explore/components/panel/DongFactGraph'
import PanelHeader from '@/features/explore/components/panel/PanelHeader'
import PanelMessage from '@/features/explore/components/panel/PanelMessage'
import PanelSkeleton from '@/features/explore/components/panel/PanelSkeleton'
import SimilarList from '@/features/explore/components/panel/SimilarList'
import SourceLine from '@/features/explore/components/panel/SourceLine'
import TypeBars from '@/features/explore/components/panel/TypeBars'

type Props = {
  dongId: string
  onBack: (dongId: string) => void
  onClose: () => void
  onOpenSimilar: (similar: SimilarDong) => void
}

/** ② 동 패널 (Figma 436:10279). 로딩 0.2초 뒤 스켈레톤(최소 0.4초), 503·404 분기 (스펙 §9) */
export default function DongPanel({ dongId, onBack, onClose, onOpenSimilar }: Props) {
  const q = useDongQuery(dongId)
  const skeleton = useDelayedLoading(q.isPending)

  if (skeleton) return <PanelSkeleton />
  if (q.isPending) {
    return (
      <div aria-busy="true" className="flex-1">
        <span className="sr-only">{EXPLORE_COPY.loadingSr}</span>
      </div>
    )
  }
  if (q.isError) {
    return q.error instanceof NotFoundError ? (
      <PanelMessage
        message={EXPLORE_COPY.dongNotFound}
        actionLabel={EXPLORE_COPY.closePanel}
        onAction={onClose}
      />
    ) : (
      <PanelMessage
        message={EXPLORE_COPY.dongError}
        actionLabel={EXPLORE_COPY.retry}
        onAction={() => q.refetch()}
      />
    )
  }
  const dong = q.data
  return (
    <DongBody
      key={dong.id}
      dong={dong}
      onBack={() => onBack(dong.id)}
      onOpenSimilar={onOpenSimilar}
    />
  )
}

type BodyProps = {
  dong: DongDetail
  onBack: () => void
  onOpenSimilar: (similar: SimilarDong) => void
}

/** 평일·주말과 상세 칸은 URL 에 넣지 않는다. 동이 바뀌면 key 로 다시 만들어 평일·시간대로 돌아간다 (스펙 §5) */
function DongBody({ dong, onBack, onOpenSimilar }: BodyProps) {
  const [day, setDay] = useState<DayGroup>('weekday')
  const [detail, setDetail] = useState<DetailKind>('hour')
  return (
    <article aria-label={dong.name} className="flex flex-1 flex-col gap-3 pt-4">
      <PanelHeader dong={dong} onBack={onBack} />
      <TypeBars types={dong.types} />
      <DongFactGraph dong={dong} day={day} detail={detail} onDetail={setDetail} />
      <DetailSlot dong={dong} day={day} onDay={setDay} detail={detail} />
      <Briefing sentences={dong.briefing} />
      <SimilarList
        similar={dong.similar}
        coastal={dong.coastKm !== null && dong.coastKm <= 1}
        onPick={onOpenSimilar}
      />
      <SourceLine>{EXPLORE_COPY.dongSource(dong.syncedAt.slice(0, 10))}</SourceLine>
    </article>
  )
}
