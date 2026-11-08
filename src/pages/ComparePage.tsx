import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQueries } from '@tanstack/react-query'
import PageContainer from '@/components/layout/PageContainer'
import MonthChips from '@/components/ui/MonthChips'
import { useToast } from '@/components/ui/toast/useToast'
import CompareChips from '@/features/compare/components/CompareChips'
import CompareColumn from '@/features/compare/components/CompareColumn'
import DongPickerModal from '@/features/compare/components/DongPickerModal'
import EmptyColumn from '@/features/compare/components/EmptyColumn'
import { COMPARE_COPY } from '@/features/compare/copy'
import { MAX_COMPARE } from '@/features/compare/params'
import { rankInSigungu } from '@/features/compare/rank'
import { useCompareList } from '@/features/compare/useCompareList'
import { fetchDong } from '@/features/dong/api'
import { dongKeys } from '@/features/dong/queryKeys'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { useMonthParam } from '@/hooks/useQueryState'

/** W-05 동네 비교. 행정동 2~3개의 곡선·성격·지표를 나란히 */
export default function ComparePage() {
  const [month, setMonth] = useMonthParam()
  const tier = useTierQuery(month, 'dong')
  const tierItems = tier.data?.items
  const validIds = useMemo(() => tierItems?.map((i) => i.id), [tierItems])

  const { ids, add, remove, canAdd, dropped } = useCompareList(validIds)
  const [pickerOpen, setPickerOpen] = useState(false)
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

  const entries = ids.map((id, i) => {
    const d = details[i].data
    const t = tierItems?.find((it) => it.id === id)
    return {
      id,
      name: d?.name ?? t?.name ?? id,
      sigunguName: d?.sigungu.name ?? t?.sigungu?.name ?? '',
    }
  })

  const firstTwins = details[0]?.data?.quieterTwins
  const emptySlots = Math.max(0, MAX_COMPARE - ids.length)

  return (
    <PageContainer className="flex flex-col gap-6 py-10">
      <header className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-2xl text-text-primary">{COMPARE_COPY.title}</h1>
          <p className="text-body-sm text-text-secondary">{COMPARE_COPY.description}</p>
        </div>
        <MonthChips value={month} onChange={setMonth} className="max-w-1/2" />
      </header>

      <CompareChips
        entries={entries}
        canAdd={canAdd}
        onRemove={remove}
        onAdd={() => setPickerOpen(true)}
      />

      <section aria-label="비교 열" className="grid grid-cols-3 gap-4">
        {ids.map((id, i) => {
          const q = details[i]
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
            />
          )
        })}
        {Array.from({ length: emptySlots }, (_, i) => (
          <EmptyColumn
            key={`empty-${i}`}
            onAdd={() => setPickerOpen(true)}
            hint={ids.length === 0 && i === 0 ? COMPARE_COPY.emptyHint : undefined}
          />
        ))}
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
