import { describe, expect, it } from 'vitest'
import { carryQuery } from '@/hooks/carryQuery'

const sp = (s: string) => new URLSearchParams(s)

describe('carryQuery', () => {
  it('month·preset 을 붙인다', () => {
    expect(carryQuery('/tier', sp('month=2025-10&preset=lively'))).toBe(
      '/tier?month=2025-10&preset=lively',
    )
  })
  it('공유 키가 아닌 것은 버린다', () => {
    expect(carryQuery('/tier', sp('month=2025-10&tab=metric&sgg=51820'))).toBe(
      '/tier?month=2025-10',
    )
  })
  it('metrics 는 preset=custom 일 때만', () => {
    expect(carryQuery('/', sp('preset=custom&metrics=quiet,vibe'))).toBe(
      '/?preset=custom&metrics=quiet%2Cvibe',
    )
    expect(carryQuery('/', sp('preset=quiet&metrics=quiet,vibe'))).toBe('/?preset=quiet')
  })
  it('to 에 이미 있는 키는 덮어쓰지 않는다', () => {
    expect(carryQuery('/compare?dongs=a,b&month=annual', sp('month=2025-10'))).toBe(
      '/compare?dongs=a%2Cb&month=annual',
    )
  })
  it('붙일 게 없으면 to 그대로', () => {
    expect(carryQuery('/me', sp(''))).toBe('/me')
  })
})
