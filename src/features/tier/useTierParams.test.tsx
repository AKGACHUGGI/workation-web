import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import { useTierParams } from '@/features/tier/useTierParams'

function Probe() {
  const p = useTierParams()
  return (
    <output data-testid="state">
      {[p.tab, p.preset, p.metrics.join(','), p.metric, p.scope, p.sgg, p.month].join('|')}
    </output>
  )
}

describe('useTierParams', () => {
  it('기본값', () => {
    renderWithRouter(<Probe />, { route: '/tier' })
    expect(screen.getByTestId('state')).toHaveTextContent(
      'value|quiet|quiet,crowd,overnight|quiet|sigungu|all|2025-12',
    )
  })

  it('행정동 범위의 숙박 성향은 quiet 로 replace 보정', async () => {
    renderWithRouter(<Probe />, { route: '/tier?scope=dong&tab=metric&metric=overnight' })
    expect(await screen.findByText('/tier?scope=dong&tab=metric&metric=quiet')).toBeInTheDocument()
  })

  it('metrics 중복은 정렬·제거해 URL 을 고친다', async () => {
    renderWithRouter(<Probe />, { route: '/tier?preset=custom&metrics=vibe,quiet,quiet' })
    expect(await screen.findByText('/tier?preset=custom&metrics=quiet%2Cvibe')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('value|custom|quiet,vibe')
  })
})
