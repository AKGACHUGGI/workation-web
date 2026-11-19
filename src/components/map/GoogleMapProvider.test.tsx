import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoogleMapProvider from '@/components/map/GoogleMapProvider'
import MapPlaceholder from '@/components/map/MapPlaceholder'

describe('GoogleMapProvider', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('키가 없으면 fallback 만 렌더한다', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')
    render(
      <GoogleMapProvider
        fallback={
          <MapPlaceholder title="지도 키가 설정되지 않았습니다">거진항 · 화진포</MapPlaceholder>
        }
      >
        <div data-testid="real-map" />
      </GoogleMapProvider>,
    )
    expect(screen.getByText('지도 키가 설정되지 않았습니다')).toBeInTheDocument()
    expect(screen.getByText('거진항 · 화진포')).toBeInTheDocument()
    expect(screen.queryByTestId('real-map')).not.toBeInTheDocument()
  })
  it('지도 영역(fallback 포함)은 라이트 범위로 감싼다', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')
    render(
      <GoogleMapProvider fallback={<p>대체</p>}>
        <p>지도</p>
      </GoogleMapProvider>,
    )
    const scope = screen.getByText('대체').closest('[data-slot="map-scope"]')
    expect(scope).toHaveAttribute('data-theme', 'light')
    expect(scope).toHaveClass('contents')
  })
})
