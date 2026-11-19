import type { ReactNode } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import MapLoadGuard from '@/components/map/MapLoadGuard'
import { hasMapsKey, mapsKey } from '@/components/map/mapsKey'

type Props = {
  /** 키가 없거나 로드 실패 시 보여줄 내용 (보통 MapPlaceholder) */
  fallback: ReactNode
  children: ReactNode
}

/** 지도 영역은 다크모드에서도 라이트로 고정한다 (다크모드 스펙 §5). display:contents 라 배치는 그대로 */
function MapLightScope({ children }: { children: ReactNode }) {
  return (
    <div data-slot="map-scope" data-theme="light" className="contents">
      {children}
    </div>
  )
}

/**
 * APIProvider 래핑. VITE_GOOGLE_MAPS_KEY 가 비어 있으면 fallback 만 렌더한다 (mock·CI·E2E 기본 상태).
 * 키가 있어도 스크립트 로드·키 인증이 실패하면 MapLoadGuard 가 fallback 으로 바꾼다 (스펙 §8).
 */
export default function GoogleMapProvider({ fallback, children }: Props) {
  if (!hasMapsKey()) return <MapLightScope>{fallback}</MapLightScope>
  return (
    <MapLightScope>
      <APIProvider apiKey={mapsKey()} language="ko" region="KR">
        <MapLoadGuard fallback={fallback}>{children}</MapLoadGuard>
      </APIProvider>
    </MapLightScope>
  )
}
