import { describe, expect, it } from 'vitest'
import { applyIntentToParams, removeIntentAxis } from '@/features/search/applyIntent'
import type { SearchIntent } from '@/features/search/types'

const intent: SearchIntent = {
  month: '2025-11',
  preset: 'quiet',
  terrain: ['coast'],
  stay: 'month',
  tags: [],
}
const sp = (s: string) => new URLSearchParams(s)

describe('applyIntentToParams', () => {
  it('비어 있는 URL 에 month·preset·terrain 을 채운다 (stay·peer 는 URL 에 안 넣음)', () => {
    expect(applyIntentToParams(intent, sp('')).toString()).toBe(
      'month=2025-11&preset=quiet&terrain=coast',
    )
  })
  it('기본(override=false)은 URL 값 우선', () => {
    expect(applyIntentToParams(intent, sp('month=2025-10&sort=views')).toString()).toBe(
      'month=2025-10&sort=views&preset=quiet&terrain=coast',
    )
  })
  it('override=true 면 덮어쓴다', () => {
    expect(applyIntentToParams(intent, sp('month=2025-10'), { override: true }).get('month')).toBe(
      '2025-11',
    )
  })
  it('preset 이 custom 이 아니게 바뀌면 metrics 를 지운다', () => {
    const out = applyIntentToParams(intent, sp('preset=custom&metrics=quiet,vibe'), {
      override: true,
    })
    expect(out.get('preset')).toBe('quiet')
    expect(out.has('metrics')).toBe(false)
  })
  it('원본 URLSearchParams 를 바꾸지 않는다', () => {
    const cur = sp('sort=views')
    applyIntentToParams(intent, cur)
    expect(cur.toString()).toBe('sort=views')
  })
})

describe('removeIntentAxis', () => {
  it('축에 해당하는 키를 지운다', () => {
    expect(removeIntentAxis('terrain', sp('month=2025-11&terrain=coast')).toString()).toBe(
      'month=2025-11',
    )
    expect(removeIntentAxis('stay', sp('month=2025-11')).toString()).toBe('month=2025-11')
  })
})
