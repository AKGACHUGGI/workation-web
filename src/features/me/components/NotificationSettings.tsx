import Toggle from '@/components/ui/Toggle'
import MePanel from '@/features/me/components/MePanel'
import { useMeSettings, useUpdateSettings } from '@/features/me/useMeSettings'
import type { MeSettings } from '@/features/me/types'

const ITEMS: { key: keyof MeSettings; label: string; hint: string }[] = [
  {
    key: 'notifyBestMonth',
    label: '가기 좋은 달 알림',
    hint: '즐겨찾기 지역의 추천 월이 다가오면 알려드려요',
  },
  {
    key: 'notifyTipReaction',
    label: '내 팁 반응 알림',
    hint: '도움돼요·답글이 달리면 알려드려요',
  },
  {
    key: 'notifyPhotoSelected',
    label: '이달의 사진 선정 알림',
    hint: '내 사진이 지역 헤더로 선정되면 알려드려요',
  },
]

export default function NotificationSettings() {
  const { data, isPending } = useMeSettings()
  const update = useUpdateSettings()

  return (
    <MePanel title="알림 설정">
      {isPending || !data ? (
        <div className="bg-bg-subtle h-24 animate-pulse rounded-lg" />
      ) : (
        ITEMS.map((item) => (
          <Toggle
            key={item.key}
            id={`setting-${item.key}`}
            label={item.label}
            description={item.hint}
            checked={data[item.key]}
            onChange={(next) => update.mutate({ [item.key]: next })}
          />
        ))
      )}
    </MePanel>
  )
}
