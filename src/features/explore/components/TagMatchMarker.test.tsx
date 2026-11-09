import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TagMatchMarker from '@/features/explore/components/TagMatchMarker'
import { indexGraph } from '@/features/explore/indexGraph'
import { matchDongs } from '@/features/explore/match'
import { exploreGraphMock } from '@/mocks/explore/graph'

vi.mock('@vis.gl/react-google-maps', () => ({
  AdvancedMarker: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <div data-testid="marker" onClick={onClick}>
      {children}
    </div>
  ),
}))

const index = indexGraph(exploreGraphMock)
const matches = matchDongs(index, ['cafe', 'beach'], 'any')
const byId = (id: string) => matches.find((m) => m.dongId === id)!

describe('TagMatchMarker', () => {
  it('모두 가진 동은 검정(all), 색 점 = 가진 태그 수', () => {
    const { container } = render(
      <TagMatchMarker
        index={index}
        dong={index.dongById.get('5115025000')!}
        match={byId('5115025000')}
        onOpenDong={() => {}}
      />,
    )
    expect(container.querySelector('[data-match="all"]')).toHaveTextContent('주문진읍')
    expect(container.querySelectorAll('[data-dot]')).toHaveLength(2)
    expect(screen.getByRole('tooltip')).toHaveTextContent('주문진읍 · 카페 7 · 해수욕장 3')
    expect(screen.getByRole('tooltip')).toHaveTextContent('누르면 주문진읍 중심 그래프로 확대')
  })
  it('일부만 가진 동은 흰색(partial), 클릭 → onOpenDong', async () => {
    const onOpenDong = vi.fn()
    const { container } = render(
      <TagMatchMarker
        index={index}
        dong={index.dongById.get('5121056000')!}
        match={byId('5121056000')}
        onOpenDong={onOpenDong}
      />,
    )
    expect(container.querySelector('[data-match="partial"]')).toHaveTextContent('교동')
    await userEvent.click(screen.getByTestId('marker'))
    expect(onOpenDong).toHaveBeenCalledWith('5121056000')
  })
})
