import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExplorePage from '@/pages/ExplorePage'
import renderWithRouter from '@/test/renderWithRouter'

const fail = vi.hoisted(() => ({ on: false }))
vi.mock('@/features/explore/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/explore/api')>()
  return {
    fetchExploreGraph: () =>
      fail.on ? Promise.reject(new Error('API 503')) : mod.fetchExploreGraph(),
  }
})

beforeEach(() => {
  fail.on = false
})

const tagBar = async () => within(await screen.findByRole('toolbar', { name: '태그' }))

describe('ExplorePage (/explore, mock · 지도 키 없음)', () => {
  it('로딩 → ⓪ 범위 요약, 지도 자리는 키 없음 안내, 경로 바', async () => {
    renderWithRouter(<ExplorePage />, { route: '/explore' })
    expect(screen.getByText('탐색 데이터를 불러오는 중이에요')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '이 지도 범위 요약' })).toBeInTheDocument()
    expect(screen.getByText('지도 키가 설정되지 않았습니다')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '경로' })).toHaveTextContent('강원특별자치도')
    expect(screen.getByRole('button', { name: '시군구 9~10', pressed: true })).toBeInTheDocument()
  })

  it('① 카페 많음 + 해수욕장 → 14 · 5, 화면 밖 칩, 모두 → match=all', async () => {
    renderWithRouter(<ExplorePage />, { route: '/explore' })
    const bar = await tagBar()
    await userEvent.click(bar.getByRole('button', { name: '카페 많음' }))
    await userEvent.click(bar.getByRole('button', { name: '해수욕장' }))
    expect(screen.getByRole('tab', { name: '하나라도 있는 동 14' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '전북특별자치도 8곳' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '선택한 태그 2개' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: '모두 있는 동 5' }))
    expect(screen.getByTestId('location')).toHaveTextContent('match=all')
  })

  it('② 동 → ③ 장소 → 동으로 → 태그 지도로', async () => {
    renderWithRouter(<ExplorePage />, { route: '/explore?tags=cafe,beach' })
    await userEvent.click(await screen.findByRole('button', { name: /주문진읍/ }))
    expect(screen.getByRole('heading', { level: 2, name: /주문진읍/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '카페 많음 · 7곳' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '태그 지도로 돌아가기 · 14곳' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /주문진항 로스터리/ }))
    expect(screen.getByText('사진·장소 정보 출처: 한국관광공사')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(/dong=5115025000&place=\d+/)

    await userEvent.click(screen.getByRole('button', { name: '주문진읍으로' }))
    expect(screen.getByRole('region', { name: '카페 많음 · 7곳' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '태그 지도로 돌아가기 · 14곳' }))
    expect(await screen.findByRole('tab', { name: '하나라도 있는 동 14' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).not.toHaveTextContent('dong=')
  })

  it('고른 조합의 동이 0곳이면 안내 + 하나라도 있는 동 보기', async () => {
    renderWithRouter(<ExplorePage />, { route: '/explore?tags=island,library&match=all' })
    expect(await screen.findByText('이 조합의 동네가 없어요')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '하나라도 있는 동 보기' }))
    expect(screen.getByTestId('location')).not.toHaveTextContent('match=')
  })

  it('오류 → 카드 + 다시 시도, 태그 바 숨김', async () => {
    fail.on = true
    renderWithRouter(<ExplorePage />, { route: '/explore' })
    expect(await screen.findByRole('alert')).toHaveTextContent('탐색 데이터를 불러오지 못했어요.')
    expect(screen.queryByRole('toolbar', { name: '태그' })).not.toBeInTheDocument()
    fail.on = false
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('toolbar', { name: '태그' })).toBeInTheDocument()
  })
})
