import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DongPickerModal from '@/features/compare/components/DongPickerModal'
import type { TierItem } from '@/features/tier/types'

const item = (id: string, name: string, sgg: [string, string], quiet: number): TierItem => ({
  id,
  name,
  province: '',
  sigungu: { id: sgg[0], name: sgg[1] },
  photoUrl: '',
  scores: { quiet, crowd: 0, peer: 0, overnight: 0, vibe: 0 },
  inherited: ['overnight'],
  terrain: ['coast'],
})

const items = [
  item('5182025300', '거진읍', ['51820', '고성군'], 37),
  item('5182033000', '죽왕면', ['51820', '고성군'], 55),
  item('5121053500', '금호동', ['51210', '속초시'], 3),
  item('5011062000', '연동', ['50110', '제주시'], 85),
]

const twins = [
  {
    id: 't1',
    name: '봉래면',
    sigunguId: '46770',
    sigunguName: '고흥군',
    similarity: 0.78,
    visitorRatio: 0.4,
    photoUrl: '',
  },
]

function setup(selectedIds = ['5182025300'], onPick = vi.fn(), onClose = vi.fn()) {
  render(
    <DongPickerModal
      open
      onClose={onClose}
      items={items}
      selectedIds={selectedIds}
      twins={twins}
      onPick={onPick}
    />,
  )
  return { onPick, onClose }
}

describe('DongPickerModal', () => {
  it('검색어로 목록을 거른다', async () => {
    setup()
    expect(screen.getAllByRole('option')).toHaveLength(4)
    await userEvent.type(screen.getByRole('searchbox'), '연')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /연동/ })).toBeInTheDocument()
  })

  it('시군구 Segmented 로 거른다', async () => {
    setup()
    await userEvent.click(screen.getByRole('tab', { name: '고성군' }))
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('이미 비교 중인 동은 비활성·체크 표시', () => {
    setup()
    const geojin = screen.getByRole('option', { name: /거진읍/ })
    expect(geojin).toHaveAttribute('aria-disabled', 'true')
    expect(geojin).toHaveAttribute('aria-selected', 'true')
  })

  it('선택하면 onPick(id) 후 닫힌다', async () => {
    const { onPick, onClose } = setup()
    await userEvent.click(screen.getByRole('option', { name: /연동/ }))
    expect(onPick).toHaveBeenCalledWith('5011062000')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('비슷한 동네 추천 탭에서도 선택할 수 있다', async () => {
    const { onPick } = setup()
    await userEvent.click(screen.getByRole('tab', { name: '비슷한 동네 추천' }))
    await userEvent.click(screen.getByRole('option', { name: /봉래면/ }))
    expect(onPick).toHaveBeenCalledWith('t1')
  })

  it('twins 가 없으면 추천 탭이 비활성', () => {
    render(
      <DongPickerModal
        open
        onClose={() => {}}
        items={items}
        selectedIds={[]}
        twins={undefined}
        onPick={() => {}}
      />,
    )
    expect(screen.getByRole('tab', { name: '비슷한 동네 추천' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('Esc 로 닫힌다', async () => {
    const { onClose } = setup()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
