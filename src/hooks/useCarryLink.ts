import { useLocation } from 'react-router-dom'
import { carryQuery } from '@/hooks/carryQuery'

/** 현재 URL 의 month·preset(·metrics) 를 유지한 링크 문자열을 돌려준다. `<Link to={useCarryLink('/tier')}>` */
export function useCarryLink(to: string): string {
  const { search } = useLocation()
  return carryQuery(to, new URLSearchParams(search))
}
