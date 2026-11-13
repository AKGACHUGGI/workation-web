import { DEFAULT_MONTH } from '@/features/metric/month'
import { useTierQuery } from '@/features/tier/useTierQuery'

/** ① 헤더의 시군구 이름·시도. pins 응답에 없어 웹의 시군구 목록(tier)에서 찾는다 (스펙 §6-1) */
export function useSigunguMeta(sgg: string | null): { name: string; province: string } | null {
  const tier = useTierQuery(DEFAULT_MONTH, 'sigungu')
  if (!sgg) return null
  const item = tier.data?.items.find((i) => i.id === sgg)
  return item ? { name: item.name, province: item.province } : null
}
