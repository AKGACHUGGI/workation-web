export const DONG_COPY = {
  curveTitle: '24시간 붐빔 곡선',
  curveCaption: (id: string) => `시간대별 보행인구 · 최대 시간대 = 100 · GET /dongs/${id}?month=`,
  /** 스펙 §3-3 툴팁: `{h}시 · 주중 {v} · 주말 {v}` */
  curveTooltip: (h: number, weekday: number, weekend: number) =>
    `${h}시 · 주중 ${weekday} · 주말 ${weekend}`,
  activityTitle: '동네 성격',
  activityCaption: '24시간 보행 패턴을 4개 유형으로 분해 · 비중 합 100',
  metricTitle: '동네 지표',
  metricCaption: (month: string, total: number, excluded: number) =>
    `${month} · 행정동 ${total}곳 백분위 (특수시설 ${excluded}곳 제외)`,
  mapTitle: '위치',
  mapNoKey: '지도 키가 설정되지 않았습니다',
  twinsTitle: '비슷한데 더 조용한 동네',
  twinsCaption:
    '활동 유형 · 계절 유형 · 또래 · 보행 밀도 · 낮 유입이 비슷하면서 방문객이 더 적은 다른 시군구의 동',
  compareLink: '다른 동네와 나란히 비교하기',
  compareLinkSub: '행정동 2~3개의 24시간 곡선과 지표를 비교합니다 (W-05)',
  specialBadge: '티어 집계 제외 동네(특수시설 패턴)',
  /** PollSection 이 `{n}명 참여 · ` 뒤에 붙인다 */
  pollParticipation: '저녁 활기 지수 검증에 반영돼요',
  loadError: '동네 정보를 불러오지 못했습니다',
  retry: '다시 시도',
  linkCopied: '링크를 복사했습니다',
} as const
