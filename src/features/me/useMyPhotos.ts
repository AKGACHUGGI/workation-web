import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { getMyPhotos } from '@/features/me/api'
import { meKeys } from '@/features/me/queryKeys'

export function useMyPhotos() {
  const { isLoggedIn } = useAuth()
  return useQuery({ queryKey: meKeys.photos, queryFn: getMyPhotos, enabled: isLoggedIn })
}
