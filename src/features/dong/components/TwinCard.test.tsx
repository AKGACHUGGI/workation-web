import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import TwinCard from '@/features/dong/components/TwinCard'
import { GEOJIN_2025_10 } from '@/mocks/dong/geojin-2025-10'

describe('TwinCard', () => {
  it('비교 링크에 현재 동과 대상 동, month 를 담는다', () => {
    renderWithRouter(
      <TwinCard twin={GEOJIN_2025_10.quieterTwins[0]} currentId="5182025300" quietGrade="A" />,
      {
        route: '/dongs/5182025300?month=2025-10',
      },
    )
    const link = screen.getByRole('link', { name: /봉래면/ })
    expect(link).toHaveAttribute('href', '/compare?dongs=5182025300%2C4677036000&month=2025-10')
    expect(link).toHaveTextContent('고흥군')
    expect(link).toHaveTextContent('유사도 0.78')
    expect(link).toHaveTextContent('방문객 0.41배')
  })
})
