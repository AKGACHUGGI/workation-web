import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQueries } from '@tanstack/react-query'
import PageContainer from '@/components/layout/PageContainer'
import MonthPicker from '@/components/ui/MonthPicker'
import Segmented from '@/components/ui/Segmented'
import { useToast } from '@/components/ui/toast/useToast'
import CompareColumn from '@/features/compare/components/CompareColumn'
import DongPickerModal from '@/features/compare/components/DongPickerModal'
import EmptyColumn from '@/features/compare/components/EmptyColumn'
import { COMPARE_COPY, DAY_LABEL } from '@/features/compare/copy'
import { rankInSigungu } from '@/features/compare/rank'
import { reconcileSlots } from '@/features/compare/slots'
import { stayAxisMax } from '@/features/compare/stayScale'
import { useCompareList } from '@/features/compare/useCompareList'
import { fetchDong } from '@/features/dong/api'
import { dongKeys } from '@/features/dong/queryKeys'
import type { DayGroup } from '@/features/dong/types'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { useMonthParam } from '@/hooks/useQueryState'

const DAY_OPTIONS = (['weekday', 'weekend'] as const).map((value) => ({
  value,
  label: DAY_LABEL[value],
}))

/** W-05 동네 비교. 행정동 2~3개의 곡선·성격·지표를 나란히 */
export default function ComparePage() {
  const [month, setMonth] = useMonthParam()
  const tier = useTierQuery(month, 'dong')
  const tierItems = tier.data?.items
  const validIds = useMemo(() => tierItems?.map((i) => i.id), [tierItems])

  const { ids, add, remove, dropped } = useCompareList(validIds)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [day, setDay] = useState<DayGroup>('weekday')
  // 칸 배치: 지운 카드 자리는 빈 칸으로 남아(카드가 제자리에서 빈 칸으로 바뀐다) 다른 카드가 밀리지 않는다
  const idsKey = ids.join(',')
  const [savedSlots, setSavedSlots] = useState(() => reconcileSlots([], ids))
  const [slotsKey, setSlotsKey] = useState(idsKey)
  // 목록이 바뀐 렌더에서도 옛 배치(지운 id 포함)로 그리지 않도록 이번 렌더부터 새 배치를 쓴다
  const slots = slotsKey === idsKey ? savedSlots : reconcileSlots(savedSlots, ids)
  if (slotsKey !== idsKey) {
    setSlotsKey(idsKey)
    setSavedSlots(slots)
  }
  const toast = useToast()

  const droppedKey = dropped.join(',')
  useEffect(() => {
    if (droppedKey) toast.show(COMPARE_COPY.droppedToast)
  }, [droppedKey, toast])

  const details = useQueries({
    queries: ids.map((id) => ({
      queryKey: dongKeys.detail(id, month),
      queryFn: () => fetchDong(id, month),
      placeholderData: keepPreviousData,
    })),
  })

  // 열들이 같은 세로축을 써야 동네끼리 체류인구 크기를 그대로 견줄 수 있다
  const stayMax = stayAxisMax(details.flatMap((q) => q.data?.stayHourly[day] ?? []))

  const firstTwins = details[0]?.data?.quieterTwins

  return (
    <PageContainer className="flex flex-col gap-6 py-8">
      <header className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-3xl text-text-primary tracking-tight">
            {COMPARE_COPY.title}
          </h1>
          <p className="text-body-base text-text-secondary">{COMPARE_COPY.description}</p>
        </div>
        {/* 요일 토글은 카드마다 두지 않고 여기서 모든 열 곡선을 한 번에 바꾼다 */}
        <div className="flex flex-col items-end gap-3">
          <MonthPicker value={month} onChange={setMonth} />
          <Segmented
            variant="surface"
            ariaLabel="요일 구분"
            options={DAY_OPTIONS}
            value={day}
            onChange={setDay}
          />
        </div>
      </header>

      <section aria-label="비교 열" className="grid grid-cols-3 items-start gap-6">
        {slots.map((id, slot) => {
          if (id === null) {
            return (
              <EmptyColumn
                key={`empty-${slot}`}
                onAdd={() => setPickerOpen(true)}
                hint={ids.length === 0 && slot === 0 ? COMPARE_COPY.emptyHint : undefined}
              />
            )
          }
          const q = details[ids.indexOf(id)]
          return (
            <CompareColumn
              key={id}
              id={id}
              detail={q.data}
              tierItem={tierItems?.find((it) => it.id === id)}
              tierPending={tier.isPending}
              rank={tierItems ? rankInSigungu(tierItems, id) : null}
              isPending={q.isPending}
              isError={q.isError}
              onRetry={() => q.refetch()}
              onRemove={() => remove(id)}
              day={day}
              stayMax={stayMax}
            />
          )
        })}
      </section>

      <p className="text-caption-xs text-text-tertiary">{COMPARE_COPY.footer}</p>

      <DongPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        items={tierItems ?? []}
        selectedIds={ids}
        twins={firstTwins}
        onPick={add}
      />
    </PageContainer>
  )
}
