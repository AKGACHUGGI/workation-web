export const exploreKeys = {
  all: ['explore'] as const,
  pins: (sigunguId: string) => ['explore', 'pins', sigunguId] as const,
  dong: (dongId: string) => ['explore', 'dong', dongId] as const,
  /** 서버 요청 없는 로컬 대화 기록 (useAskThread) */
  askThread: (dongId: string) => ['explore', 'ask', dongId] as const,
}
