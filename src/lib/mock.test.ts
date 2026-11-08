import { describe, expect, it } from 'vitest'
import { mockDelay } from '@/lib/mock'

describe('mockDelay', () => {
  it('지정한 데이터를 그대로 resolve 한다', async () => {
    await expect(mockDelay({ a: 1 }, 0)).resolves.toEqual({ a: 1 })
  })
})
