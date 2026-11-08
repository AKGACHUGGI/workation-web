import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Segmented from '@/components/ui/Segmented'
import DongSearchList from '@/features/compare/components/DongSearchList'
import TwinSuggestList from '@/features/compare/components/TwinSuggestList'
import type { QuieterTwin } from '@/features/dong/types'
import type { TierItem } from '@/features/tier/types'

type Tab = 'search' | 'twins'

type Props = {
  open: boolean
  onClose: () => void
  /** tier dong 응답 items (이름·시군구·점수) */
  items: TierItem[]
  selectedIds: string[]
  /** 첫 번째 열 동의 quieterTwins. 없으면 추천 탭 비활성 */
  twins?: QuieterTwin[]
  onPick: (id: string) => void
}

const TITLE_ID = 'dong-picker-title'

/** 동 추가 모달: 찾기 / 비슷한 동네 추천. 선택 즉시 추가되고 닫힌다 */
export default function DongPickerModal({
  open,
  onClose,
  items,
  selectedIds,
  twins,
  onPick,
}: Props) {
  const [tab, setTab] = useState<Tab>('search')

  const pick = (id: string) => {
    onPick(id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} titleId={TITLE_ID} width="md">
      <div className="flex flex-col gap-4">
        <h2 id={TITLE_ID} className="text-heading-lg text-text-primary">
          행정동 추가
        </h2>
        <Segmented<Tab>
          options={[
            { value: 'search', label: '찾기' },
            {
              value: 'twins',
              label: '비슷한 동네 추천',
              disabled: !twins,
              title: twins ? undefined : '먼저 동네를 하나 추가하면 비슷한 동네를 추천합니다',
            },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="추가 방식"
        />
        {tab === 'search' ? (
          <DongSearchList items={items} selectedIds={selectedIds} onPick={pick} />
        ) : (
          <TwinSuggestList twins={twins ?? []} selectedIds={selectedIds} onPick={pick} />
        )}
      </div>
    </Modal>
  )
}
