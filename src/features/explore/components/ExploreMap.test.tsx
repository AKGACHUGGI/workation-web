import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { GeoFeatureCollection } from '@/components/map/geo'
import ExploreMap from '@/features/explore/components/ExploreMap'
import { pinsMock } from '@/mocks/explore/pins'
import renderWithRouter from '@/test/renderWithRouter'

const status = vi.hoisted(() => ({ value: 'LOADED' }))

vi.mock('@vis.gl/react-google-maps', () => ({
  APILoadingStatus: { NOT_LOADED: 'NOT_LOADED', LOADING: 'LOADING', LOADED: 'LOADED' },
  useApiLoadingStatus: () => status.value,
  useMap: () => null,
  Map: ({ children }: { children: ReactNode }) => <div data-testid="google-map">{children}</div>,
  AdvancedMarker: ({
    children,
    onClick,
    title,
  }: {
    children: ReactNode
    onClick?: () => void
    title?: string
  }) => (
    <div data-testid="marker" title={title} onClick={onClick}>
      {children}
    </div>
  ),
}))

const geo: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: ['5115025000', '5115037000', '5115036000'].map((id, i) => ({
    type: 'Feature',
    properties: { id, name: id, labelLat: 37.8 + i / 10, labelLng: 128.8 },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [128, 37],
          [129, 37],
          [129, 38],
        ],
      ],
    },
  })),
}

const base = {
  sgg: null,
  pins: undefined,
  pinsLoading: false,
  geo: undefined,
  hoveredDong: null,
  selectedDong: null,
  onPickSigungu: () => {},
  onPickDong: () => {},
  onHoverDong: () => {},
  camera: null,
}

beforeEach(() => {
  status.value = 'LOADED'
})

describe('ExploreMap', () => {
  it('지도 SDK 로딩 중 → MapSkeleton (L1)', () => {
    status.value = 'LOADING'
    renderWithRouter(<ExploreMap {...base} />)
    expect(screen.queryByTestId('google-map')).not.toBeInTheDocument()
    expect(screen.getByText('불러오는 중').closest('[aria-busy="true"]')).toBeInTheDocument()
  })
  it('⓪: 지도 + ⓪ 범례, 핀 없음', () => {
    renderWithRouter(<ExploreMap {...base} />)
    expect(screen.getByTestId('google-map')).toBeInTheDocument()
    expect(screen.getByText('종합 점수 (홈과 같은 색)')).toBeInTheDocument()
    expect(screen.queryAllByTestId('marker')).toHaveLength(0)
  })
  it('① 핀 로딩 0.2초 뒤 → 경계 파일 동 수만큼 회색 알약 (L2)', async () => {
    const { container } = renderWithRouter(
      <ExploreMap {...base} sgg="51150" geo={geo} pinsLoading />,
    )
    expect(container.querySelectorAll('[data-skeleton-pin]')).toHaveLength(0)
    await screen.findAllByTestId('marker')
    expect(container.querySelectorAll('[data-skeleton-pin]')).toHaveLength(3)
  })
  it('① 핀 21개 + ① 범례, 핀 클릭 → onPickDong', async () => {
    const onPickDong = vi.fn()
    renderWithRouter(
      <ExploreMap
        {...base}
        sgg="51150"
        geo={geo}
        pins={pinsMock('51150')!.dongs}
        onPickDong={onPickDong}
      />,
    )
    expect(screen.getAllByTestId('marker')).toHaveLength(21)
    expect(screen.getByText('동네 핀 (아이콘 = 대표 태그)')).toBeInTheDocument()
    await userEvent.click(screen.getByTitle('주문진읍'))
    expect(onPickDong).toHaveBeenCalledWith('5115025000')
  })
})
