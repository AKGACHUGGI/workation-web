import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast/useToast'
import { useAuth } from '@/features/auth/useAuth'
import { getMeSettings, patchMeSettings } from '@/features/me/api'
import { ME_COPY } from '@/features/me/copy'
import { meKeys } from '@/features/me/queryKeys'
import type { MeSettings } from '@/features/me/types'

export function useMeSettings() {
  const { isLoggedIn } = useAuth()
  return useQuery({ queryKey: meKeys.settings, queryFn: getMeSettings, enabled: isLoggedIn })
}

/** 토글 즉시 PATCH. 낙관적 갱신, 실패 시 롤백 + 토스트 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const { show } = useToast()
  return useMutation({
    mutationFn: (patch: Partial<MeSettings>) => patchMeSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: meKeys.settings })
      const prev = queryClient.getQueryData<MeSettings>(meKeys.settings)
      if (prev) queryClient.setQueryData<MeSettings>(meKeys.settings, { ...prev, ...patch })
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(meKeys.settings, ctx.prev)
      show(ME_COPY.settingsFailed)
    },
    onSuccess: (data) => queryClient.setQueryData(meKeys.settings, data),
  })
}
