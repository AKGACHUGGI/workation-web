import type { ReactNode } from 'react'
import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps'

type Props = { fallback: ReactNode; children: ReactNode }

/** APIProvider 안에서만 쓴다. 로드 실패(FAILED)·키 인증 실패(AUTH_FAILURE)면 fallback */
export default function MapLoadGuard({ fallback, children }: Props) {
  const status = useApiLoadingStatus()
  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
