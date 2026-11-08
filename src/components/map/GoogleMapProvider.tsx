import type { ReactNode } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { hasMapsKey, mapsKey } from '@/components/map/mapsKey'

type Props = {
  /** 키가 없거나 로드 실패 시 보여줄 내용 (보통 MapPlaceholder) */
  fallback: ReactNode
  children: ReactNode
}

/** APIProvider 래핑. VITE_GOOGLE_MAPS_KEY 가 비어 있으면 fallback 만 렌더한다 (mock·CI·E2E 기본 상태) */
export default function GoogleMapProvider({ fallback, children }: Props) {
  if (!hasMapsKey()) return <>{fallback}</>
  return (
    <APIProvider apiKey={mapsKey()} language="ko" region="KR">
      {children}
    </APIProvider>
  )
}
