import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { getMyFavorites } from '@/features/me/api'
import { meKeys } from '@/features/me/queryKeys'
import type { MonthParam } from '@/features/metric/month'

export function useMyFavorites(month: MonthParam) {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: meKeys.favorites(month),
    queryFn: () => getMyFavorites(month),
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
  })
}
