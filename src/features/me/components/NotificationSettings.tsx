import Toggle from '@/components/ui/Toggle'
import { useMeSettings, useUpdateSettings } from '@/features/me/useMeSettings'
import type { MeSettings } from '@/features/me/types'

const ITEMS: { key: keyof MeSettings; label: string; hint: string }[] = [
  {
    key: 'notifyBestMonth',
    label: '가기 좋은 달 알림',
    hint: '즐겨찾기 지역의 추천 월이 다가오면',
  },
  { key: 'notifyTipReaction', label: '내 팁 반응 알림', hint: '도움돼요·답글이 달리면' },
  { key: 'notifyPhotoSelected', label: '이달의 사진 선정 알림', hint: '올린 사진이 선정되면' },
]

export default function NotificationSettings() {
  const { data, isPending } = useMeSettings()
  const update = useUpdateSettings()

  return (
    <section className="border-border-default bg-bg-surface flex flex-col gap-4 rounded-xl border p-5">
      <h2 className="text-title-md text-text-primary">알림 설정</h2>
      {isPending || !data ? (
        <div className="bg-bg-subtle h-24 animate-pulse rounded-lg" />
      ) : (
        ITEMS.map((item) => (
          <div key={item.key} className="flex flex-col gap-1">
            <Toggle
              id={`setting-${item.key}`}
              label={item.label}
              checked={data[item.key]}
              onChange={(next) => update.mutate({ [item.key]: next })}
            />
            <span className="text-caption-xs text-text-tertiary">{item.hint}</span>
          </div>
        ))
      )}
    </section>
  )
}
