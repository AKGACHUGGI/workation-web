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
})
