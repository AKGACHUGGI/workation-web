import { useQuery, useQueryClient } from '@tanstack/react-query'
import { postChat } from '@/features/chat/api'
import { CHAT_COPY } from '@/features/chat/copy'
import { chatKeys } from '@/features/chat/queryKeys'
import type { ChatErrorKind, ChatTarget, ChatThread, ChatTurn } from '@/features/chat/types'
import { chatInterest } from '@/features/interest'

/** api() 가 던지는 `API {status} …` 메시지에서 화면 분기를 고른다. 그 밖(네트워크·503·404)은 다시 시도 */
export function chatErrorKind(error: unknown): ChatErrorKind {
  const status = error instanceof Error ? /^API (\d{3})/.exec(error.message)?.[1] : undefined
  if (status === '429') return 'limit'
  if (status === '400') return 'invalid'
  return 'retry'
}

const keyOf = (t: ChatTarget) =>
  t.surface === 'dong' ? chatKeys.dong(t.dongId) : chatKeys.region(t.sigunguId)

const emptyThread = (t: ChatTarget): ChatThread => ({
  conversationId: null,
  turns: [],
  examples: [...(t.surface === 'dong' ? CHAT_COPY.chatExamples : CHAT_COPY.regionExamples)],
})

/** 요청의 대상 부분. 달은 기록 키에 넣지 않는다(달을 바꿔도 대화는 이어진다) */
const targetBody = (t: ChatTarget) =>
  t.surface === 'dong'
    ? { surface: 'dong' as const, panel: t.dongId, month: t.month }
    : { surface: 'region' as const, sigungu: t.sigunguId, month: t.month }

const withTurn = (t: ChatThread, turn: ChatTurn): ChatThread => ({
  ...t,
  turns: t.turns.map((x) => (x.id === turn.id ? turn : x)),
})

const isPending = (t: ChatThread) => t.turns.some((x) => x.status === 'pending')

let seq = 0

/**
 * 상세 페이지 채팅 기록 (시군구 채팅 스펙 §8). 기록은 chatKeys.dong(id) · chatKeys.region(id) 에
 * 두어(gcTime Infinity, 서버 요청 없음) 대상을 바꿨다 돌아와도 남고, 새로고침하면 사라진다.
 * 서버가 준 conversationId 를 그 대상 기록에 두고 다음 질문에 실어 이어 묻는다.
 * 서버가 30분 지나 대화를 잊고 새 id 를 주면 화면 기록은 두고 id 만 바꾼다.
 * 응답이 오기 전에 대상을 바꿔도 질문한 대상의 기록에 답이 붙는다
 */
export function useChatThread(target: ChatTarget) {
  const client = useQueryClient()
  const key = keyOf(target)
  const { data: thread } = useQuery({
    queryKey: key,
    queryFn: () => emptyThread(target),
    initialData: () => emptyThread(target),
    staleTime: Infinity,
    gcTime: Infinity,
  })
  const pending = isPending(thread)

  /** 렌더 사이에 두 번 눌러도 한 번만 보내도록 캐시의 지금 값을 본다 */
  const current = () => client.getQueryData<ChatThread>(key) ?? thread
  const update = (fn: (t: ChatThread) => ChatThread) =>
    client.setQueryData<ChatThread>(key, (old) => fn(old ?? emptyThread(target)))

  async function run(id: string, question: string) {
    try {
      const res = await postChat({
        conversationId: current().conversationId,
        ...targetBody(target),
        question,
        criteria: { chips: [], interest: chatInterest() },
      })
      const done: ChatTurn = {
        id,
        question,
        status: 'done',
        sentences: res.sentences.map(({ text, source }) => ({ text, source })),
        guide: res.guide,
        scope: res.scope,
        dongs: res.dongs,
      }
      update((t) => ({
        ...withTurn(t, done),
        conversationId: res.conversationId,
        examples: res.examples.length > 0 ? res.examples : t.examples,
      }))
    } catch (error) {
      const failed: ChatTurn = { id, question, status: 'error', kind: chatErrorKind(error) }
      update((t) => withTurn(t, failed))
    }
  }

  /** 앞뒤 공백을 빼고 보낸다. 빈 질문이나 대기 중이면 무시 */
  function ask(raw: string) {
    const question = raw.trim()
    if (!question || isPending(current())) return
    const id = `chat-${++seq}`
    update((t) => ({ ...t, turns: [...t.turns, { id, question, status: 'pending' }] }))
    void run(id, question)
  }

  /** 실패한 차례를 그 자리에서 다시 묻는다 */
  function retry(id: string) {
    const now = current()
    const turn = now.turns.find((x) => x.id === id)
    if (!turn || turn.status !== 'error' || isPending(now)) return
    update((t) => withTurn(t, { id, question: turn.question, status: 'pending' }))
    void run(id, turn.question)
  }

  return { thread, pending, ask, retry }
}
