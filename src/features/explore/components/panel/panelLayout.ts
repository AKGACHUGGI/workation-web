/**
 * ② 패널 섹션 높이 (Figma ②-v6 436:9725). 스켈레톤(L3 429:10054)과 실제 패널이 같은 값을 써서
 * 데이터가 와도 화면이 움직이지 않는다 (스펙 §9-1). 비슷한 동·출처는 내용 길이를 따른다
 */
export const DONG_SECTION_H = {
  header: 'h-15.5',
  types: 'h-41.5',
  graph: 'h-53',
  detail: 'h-28',
  briefing: 'min-h-25',
} as const

/** ① 헤더 (Figma ①-v6 434:9725) */
export const SIGUNGU_HEADER_H = 'h-11'

/** ① 지식그래프 영역 (Figma 434:9744 400×400, 패널 안쪽 폭 399) */
export const GRAPH_W = 399
export const GRAPH_H = 400
