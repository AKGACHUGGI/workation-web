import type { ReportResponse } from '@/features/report/types'
import { makeReportMock } from '@/mocks/report/generate'

const generated = makeReportMock('51820', 'quiet')!

/** 고성군 · 연간 · 조용한 곳 (Figma 251:4392) */
export const goseongQuiet = {
  ...generated,
  seasonNarrative:
    '7·8월 여름 성수기 뒤 10월에 다시 오르는 하반기 상승형입니다. 2~4월·12월은 연중 최대의 절반 이하로, 비수기 체류 지원에 적합합니다.',
  diagnosis: {
    strength:
      '숙박 계수 0.98로 방문객 대부분이 밤에도 머무는 숙박형 지역이고, 동네 조용함 2위로 근무 시간대 유입이 적어 장기 체류형 워케이션에 유리합니다.',
    weakness:
      '저녁 활기 11위·또래 밀도 10위로 20~40대 방문 비중이 낮고, 성수기 집중도 35%는 12곳 평균 30%보다 높아 7·8월에 방문이 쏠립니다.',
    suggestion:
      '2~4월·12월 비수기에 토성면·죽왕면 등 조용한 동네를 중심으로 한 달 체류 지원사업을 운영하고, 저녁 상권 프로그램으로 또래 체류를 늘리는 전략이 적합합니다.',
  },
} satisfies ReportResponse
