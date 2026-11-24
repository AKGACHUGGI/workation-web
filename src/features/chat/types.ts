import type { ChatInterest } from '@/features/interest'

/** POST /api/explore/chat 문장의 출처 (탐색 v7 채팅 백엔드 스펙 §8). evidence 는 쓰지 않아 두지 않는다 */
export type ChatSource = 'llm' | 'mixed' | 'rule'
export type ChatSentence = { text: string; source: ChatSource }
/** POST /api/explore/chat 요청. chips 는 웹에서 늘 [] (웹 스펙 §2) */
export type ChatRequest = {
  conversationId: string | null
  panel: string
  question: string
  criteria: { chips: string[]; interest: ChatInterest }
}
/**
 * POST /api/explore/chat 응답. 모르는 질문·다른 시군구·시군구 이름만 말함은 sentences 가 비고 guide 만,
 * 동 4개 이상이면 guide 와 비교 sentences 가 함께 온다
 */
export type ChatResponse = {
  conversationId: string
  dongs: { id: string; name: string }[]
  intent: string
  sentences: ChatSentence[]
  guide: string | null
  examples: string[]
}
/** retry = 네트워크·503 등(다시 시도), limit = 429, invalid = 400 */
export type ChatErrorKind = 'retry' | 'limit' | 'invalid'
export type ChatTurn =
  | { id: string; question: string; status: 'pending' }
  | {
      id: string
      question: string
      status: 'done'
      sentences: ChatSentence[]
      guide: string | null
    }
  | { id: string; question: string; status: 'error'; kind: ChatErrorKind }
/** 동 하나의 대화. 화면이 떠 있는 동안만 QueryClient 에 남는다. conversationId 는 서버 대화 기억 id */
export type ChatThread = { conversationId: string | null; turns: ChatTurn[]; examples: string[] }
