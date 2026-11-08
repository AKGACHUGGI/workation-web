import Chip from '@/components/ui/Chip'
import { SEARCH_EXAMPLES } from '@/features/search/examples'

type Props = { onPick: (text: string) => void }

export default function ExampleChips({ onPick }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption-xs text-text-tertiary">이렇게 물어보세요</span>
      {SEARCH_EXAMPLES.map((s) => (
        <Chip key={s} onClick={() => onPick(s)}>
          {s}
        </Chip>
      ))}
    </div>
  )
}
