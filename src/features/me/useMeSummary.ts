import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { getMeSummary } from '@/features/me/api'
import { meKeys } from '@/features/me/queryKeys'

export function useMeSummary() {
  const { isLoggedIn } = useAuth()
  return useQuery({ queryKey: meKeys.summary, queryFn: getMeSummary, enabled: isLoggedIn })
}
