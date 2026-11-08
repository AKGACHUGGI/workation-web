import { useMutation } from '@tanstack/react-query'
import { parseSearch } from '@/features/search/api'
import { useToast } from '@/components/ui/toast/useToast'

export const SEARCH_TIMEOUT_MS = 5000
export const SEARCH_FAIL_MESSAGE = '검색 조건을 분석하지 못했습니다. 잠시 후 다시 시도해 주세요'

/** POST /api/search/parse. 5초 타임아웃, 실패 시 토스트. */
export function useSearchParse() {
  const toast = useToast()
  return useMutation({
    mutationFn: async (text: string) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS)
      try {
        return await parseSearch(text, controller.signal)
      } finally {
        clearTimeout(timer)
      }
    },
    onError: () => toast.show(SEARCH_FAIL_MESSAGE),
  })
}
