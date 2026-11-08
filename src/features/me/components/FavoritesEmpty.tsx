import { Link } from 'react-router-dom'
import { ME_COPY } from '@/features/me/copy'
import { useCarryLink } from '@/hooks/useCarryLink'

export default function FavoritesEmpty() {
  const home = useCarryLink('/')
  return (
    <div className="border-border-default flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
      <p className="text-body-base text-text-secondary">{ME_COPY.favoritesEmpty}</p>
      <Link to={home} className="text-body-sm text-text-primary underline">
        탐색하기
      </Link>
    </div>
  )
}
