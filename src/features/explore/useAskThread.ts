import { useQuery, useQueryClient } from '@tanstack/react-query'
import { askDong } from '@/features/explore/api'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { exploreKeys } from '@/features/explore/queryKeys'
import type { AskErrorKind, AskThread, AskTurn } from '@/features/explore/types'

/** api() 가 던지는 `API {status} …` 메시지에서 화면 분기를 고른다. 그 밖(네트워크·503·404)은 다시 시도 */
export function askErrorKind(error: unknown): AskErrorKind {
  const status = error instanceof Error ? /^API (\d{3})/.exec(error.message)?.[1] : undefined
  if (status === '429') return 'limit'
  if (status === '400') return 'invalid'
  return 'retry'
}

const emptyThread = (): AskThread => ({ turns: [], examples: [...EXPLORE_COPY.askExamples] })

const withTurn = (t: AskThread, turn: AskTurn): AskThread => ({
  ...t,
  turns: t.turns.map((x) => (x.id === turn.id ? turn : x)),
})

const isPending = (t: AskThread) => t.turns.some((x) => x.status === 'pending')

let seq = 0

/**
 * ② 동네에 물어보기 대화 기록 (물어보기 스펙 §4-2). 기록은 QueryClient 의 exploreKeys.askThread(id) 에
 * 두어(gcTime Infinity, 서버 요청 없음) 동을 바꿨다 돌아와도 남고, 새로고침하면 사라진다.
 * 응답이 오기 전에 동을 바꿔도 질문한 동의 기록에 답이 붙는다
 */
export function useAskThread(dongId: string) {
  const client = useQueryClient()
  const key = exploreKeys.askThread(dongId)
  const { data: thread } = useQuery({
    queryKey: key,
    queryFn: emptyThread,
    initialData: emptyThread,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  const pending = isPending(thread)

  /** 렌더 사이에 두 번 눌러도 한 번만 보내도록 캐시의 지금 값을 본다 */
  const current = () => client.getQueryData<AskThread>(key) ?? thread
  const update = (fn: (t: AskThread) => AskThread) =>
    client.setQueryData<AskThread>(key, (old) => fn(old ?? emptyThread()))

  async function run(id: string, question: string) {
    try {
      const res = await askDong(dongId, question)
      const done: AskTurn = { id, question, status: 'done', answer: res.answer, source: res.source }
      update((t) => ({
        ...withTurn(t, done),
        examples: res.examples.length > 0 ? res.examples : t.examples,
      }))
    } catch (error) {
      const failed: AskTurn = { id, question, status: 'error', kind: askErrorKind(error) }
      update((t) => withTurn(t, failed))
    }
  }

  /** 앞뒤 공백을 빼고 보낸다. 빈 질문이나 대기 중이면 무시 */
  function ask(raw: string) {
    const question = raw.trim()
    if (!question || isPending(current())) return
    const id = `ask-${++seq}`
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
