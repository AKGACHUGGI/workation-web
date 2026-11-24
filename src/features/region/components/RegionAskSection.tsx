import ChatThread from '@/features/chat/components/ChatThread'
import { CHAT_COPY } from '@/features/chat/copy'
import type { MonthParam } from '@/features/metric/month'
import DetailSection from '@/features/region/components/DetailSection'

type Props = {
  sigunguId: string
  name: string
  month: MonthParam
  /** 답에 나온 동의 "자세히 →" 주소 (페이지의 hrefFor: month·preset 유지) */
  dongHref: (dongId: string) => string
}

/**
 * 시군구 상세 채팅 (시군구 채팅 스펙 §8). 시군구에 묻는다("조용한 동네 어디야?").
 * 답에 나온 동마다 "자세히 →" 로 동 상세에 보낸다. 동 이름을 넣어 물으면 같은 대화에서 동 답이 온다
 */
export default function RegionAskSection({ sigunguId, name, month, dongHref }: Props) {
  return (
    <DetailSection title={CHAT_COPY.regionTitle(name)} titleId="region-ask-title">
      <ChatThread
        target={{ surface: 'region', sigunguId, month }}
        label={CHAT_COPY.regionTitle(name)}
        placeholder={CHAT_COPY.regionPlaceholder(name)}
        dongHref={dongHref}
      />
    </DetailSection>
  )
}
