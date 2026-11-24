/** 서버 요청 없는 로컬 대화 기록 (useChatThread). 동 · 시군구마다 하나 */
export const chatKeys = {
  dong: (dongId: string) => ['chat', 'dong', dongId] as const,
}
