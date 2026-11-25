import type { ChatInterest } from '@/features/interest'
import type { MonthParam } from '@/features/metric/month'

/** 채팅 대상. 동 상세는 그 동, 시군구 상세는 그 시군구 (시군구 채팅 스펙 §3) */
export type ChatTarget =
  | { surface: 'dong'; dongId: string; month: MonthParam | null }
  | { surface: 'region'; sigunguId: string; month: MonthParam | null }
export type ChatScope = 'dong' | 'region'

/** POST /api/explore/chat 문장의 출처 (탐색 v7 채팅 백엔드 스펙 §8). evidence 는 쓰지 않아 두지 않는다 */
export type ChatSource = 'llm' | 'mixed' | 'rule'
export type ChatSentence = { text: string; source: ChatSource }
/** POST /api/explore/chat 요청. chips 는 웹에서 늘 []. month 는 보행·방문 기준 문장에 쓴다 */
export type ChatRequest = {
  conversationId: string | null
  surface: ChatScope
  panel?: string
  sigungu?: string
  month: string | null
  question: string
  criteria: { chips: string[]; interest: ChatInterest }
}
/**
 * POST /api/explore/chat 응답. scope 는 이번 답이 시군구 답인지 동 답인지.
 * 시군구 답의 dongs 는 찾은 동(최대 3), 동 답의 dongs 는 비교 대상
 */
export type ChatResponse = {
  conversationId: string
  scope: ChatScope
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
      scope: ChatScope
      dongs: { id: string; name: string }[]
    }
  | { id: string; question: string; status: 'error'; kind: ChatErrorKind }
/** 동 · 시군구 하나의 대화. 화면이 떠 있는 동안만 QueryClient 에 남는다. conversationId 는 서버 대화 기억 id */
export type ChatThread = { conversationId: string | null; turns: ChatTurn[]; examples: string[] }
