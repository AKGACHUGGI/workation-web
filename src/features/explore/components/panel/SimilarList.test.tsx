import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SimilarList from '@/features/explore/components/panel/SimilarList'
import { diffLabel } from '@/features/explore/labels'
import { GEUMAM, JUMUNJIN } from '@/test/fixtures/explore'

describe('SimilarList', () => {
  it('바닷가 동: 제목·설명, 3행(이름 · 공통 n · 공통 사실 · 점수 차), 행 클릭 → onPick', async () => {
    const onPick = vi.fn()
    render(<SimilarList similar={JUMUNJIN.similar} coastal onPick={onPick} />)
    expect(screen.getByRole('heading', { name: '비슷한 바닷가 동' })).toBeInTheDocument()
    expect(screen.getByText('지표 거리 기준 · 점수 차 = 상대 − 이 동')).toBeInTheDocument()
    const rows = within(screen.getByRole('list', { name: '비슷한 바닷가 동' })).getAllByRole(
      'button',
    )
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveTextContent('속초시 노학동')
    expect(rows[0]).toHaveTextContent('공통 6')
    expect(rows[0]).toHaveTextContent('조용함 B · 1위 장기체류형 · 바닷가')
    expect(rows[0]).toHaveTextContent(diffLabel(JUMUNJIN.similar[0].diff))
    await userEvent.click(rows[1])
    expect(onPick).toHaveBeenCalledWith(JUMUNJIN.similar[1])
  })
  it('내륙 동은 "비슷한 동"', () => {
    render(<SimilarList similar={GEUMAM.similar} coastal={false} onPick={() => {}} />)
    expect(screen.getByRole('heading', { name: '비슷한 동' })).toBeInTheDocument()
  })
  it('빈 배열이면 칸을 숨긴다', () => {
    const { container } = render(<SimilarList similar={[]} coastal onPick={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
