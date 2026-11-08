import Chip from '@/components/ui/Chip'
import { SEARCH_EXAMPLES } from '@/features/search/examples'

type Props = { onPick: (text: string) => void }

export default function ExampleChips({ onPick }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-body-sm text-text-secondary">이렇게 물어보세요</span>
      {SEARCH_EXAMPLES.map((s) => (
        <Chip key={s} size="md" onClick={() => onPick(s)}>
          {s}
        </Chip>
      ))}
    </div>
  )
}
