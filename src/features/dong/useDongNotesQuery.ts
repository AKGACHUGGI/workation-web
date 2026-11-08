import { useQuery } from '@tanstack/react-query'
import { fetchDongNotes } from '@/features/dong/api'
import { dongKeys } from '@/features/dong/queryKeys'

export function useDongNotesQuery(id: string) {
  return useQuery({
    queryKey: dongKeys.notes(id, 'helpful'),
    queryFn: () => fetchDongNotes(id, 'helpful'),
  })
}
