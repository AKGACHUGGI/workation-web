import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { deleteMyTip, getMyTips } from '@/features/me/api'
import { meKeys } from '@/features/me/queryKeys'

export function useMyTips() {
  const { isLoggedIn } = useAuth()
  return useInfiniteQuery({
    queryKey: meKeys.tips,
    queryFn: ({ pageParam }) => getMyTips(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: isLoggedIn,
  })
}

export function useDeleteMyTip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMyTip,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.tips })
      queryClient.invalidateQueries({ queryKey: meKeys.summary })
    },
  })
}
