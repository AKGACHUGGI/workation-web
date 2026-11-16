import { useQuery, useQueryClient } from '@tanstack/react-query'
import { postChat } from '@/features/explore/api'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { exploreKeys } from '@/features/explore/queryKeys'
import type { ChatErrorKind, ChatThread, ChatTurn } from '@/features/explore/types'
import { chatInterest } from '@/features/interest'

/** api() 가 던지는 `API {status} …` 메시지에서 화면 분기를 고른다. 그 밖(네트워크·503·404)은 다시 시도 */
export function chatErrorKind(error: unknown): ChatErrorKind {
  const status = error instanceof Error ? /^API (\d{3})/.exec(error.message)?.[1] : undefined
  if (status === '429') return 'limit'
  if (status === '400') return 'invalid'
  return 'retry'
}

const emptyThread = (): ChatThread => ({
  conversationId: null,
  turns: [],
  examples: [...EXPLORE_COPY.chatExamples],
})

const withTurn = (t: ChatThread, turn: ChatTurn): ChatThread => ({
  ...t,
  turns: t.turns.map((x) => (x.id === turn.id ? turn : x)),
})

const isPending = (t: ChatThread) => t.turns.some((x) => x.status === 'pending')

let seq = 0

/**
 * ② 동 패널 채팅 기록 (웹 스펙 §4-2). 기록은 QueryClient 의 exploreKeys.chatThread(id) 에
 * 두어(gcTime Infinity, 서버 요청 없음) 동을 바꿨다 돌아와도 남고, 새로고침하면 사라진다.
 * 서버가 준 conversationId 를 그 동 기록에 두고 다음 질문에 실어 이어 묻는다.
 * 서버가 30분 지나 대화를 잊고 새 id 를 주면 화면 기록은 두고 id 만 바꾼다.
 * 응답이 오기 전에 동을 바꿔도 질문한 동의 기록에 답이 붙는다
 */
export function useChatThread(dongId: string) {
  const client = useQueryClient()
  const key = exploreKeys.chatThread(dongId)
  const { data: thread } = useQuery({
    queryKey: key,
    queryFn: emptyThread,
    initialData: emptyThread,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  const pending = isPending(thread)

  /** 렌더 사이에 두 번 눌러도 한 번만 보내도록 캐시의 지금 값을 본다 */
  const current = () => client.getQueryData<ChatThread>(key) ?? thread
  const update = (fn: (t: ChatThread) => ChatThread) =>
    client.setQueryData<ChatThread>(key, (old) => fn(old ?? emptyThread()))

  async function run(id: string, question: string) {
    try {
      const res = await postChat({
        conversationId: current().conversationId,
        panel: dongId,
        question,
        criteria: { chips: [], interest: chatInterest() },
      })
      const done: ChatTurn = {
        id,
        question,
        status: 'done',
        sentences: res.sentences.map(({ text, source }) => ({ text, source })),
        guide: res.guide,
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
