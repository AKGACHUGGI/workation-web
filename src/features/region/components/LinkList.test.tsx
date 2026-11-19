import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import LinkList from '@/features/region/components/LinkList'

describe('LinkList', () => {
  it('링크가 없으면 안내 문구와 시도·시군구 이름으로 된 외부 검색 링크 3개를 보여 준다', () => {
    render(<LinkList links={[]} area="전라남도 여수시" />)
    expect(screen.getByText(/아직 등록된 지원사업·숙박·관광 정보가 없어요/)).toBeInTheDocument()
    const items = screen.getAllByRole('link')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('전라남도 여수시 워케이션 지원사업 검색')
    expect(items[0]).toHaveAttribute(
      'href',
      `https://search.naver.com/search.naver?query=${encodeURIComponent('전라남도 여수시 워케이션 지원사업')}`,
    )
    expect(screen.queryByText(/region_link/)).not.toBeInTheDocument()
  })

  it('링크가 있으면 지원사업 → 숙박 → 관광 순으로 묶고 도메인을 보여 준다', () => {
    render(
      <LinkList
        area="전라남도 여수시"
        links={[
          { kind: 'tour', title: '여수 관광', url: 'https://tour.example.com/a' },
          { kind: 'support', title: '여수 워케이션 지원', url: 'https://gov.example.com/b' },
          { kind: 'stay', title: '여수 숙소', url: 'https://stay.example.com/c' },
        ]}
      />,
    )
    expect(screen.queryByText(/아직 등록된/)).not.toBeInTheDocument()
    const titles = screen.getAllByRole('link').map((a) => a.textContent)
    expect(titles[0]).toContain('여수 워케이션 지원')
    expect(titles[1]).toContain('여수 숙소')
    expect(titles[2]).toContain('여수 관광')
    expect(within(screen.getAllByRole('link')[0]).getByText('gov.example.com')).toBeInTheDocument()
  })
})
