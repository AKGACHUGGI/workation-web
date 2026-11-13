import { AdvancedMarker } from '@vis.gl/react-google-maps'
import DongPin from '@/features/explore/components/DongPin'
import type { PinDong } from '@/features/explore/types'

type Props = {
  pins: PinDong[]
  hoveredDong: string | null
  selectedDong: string | null
  onPickDong: (id: string) => void
  onHoverDong: (id: string | null) => void
}

/** ① 핀 층. 핀 클릭 = 바로 ② (스펙 §5). 선택·hover 핀이 위로 */
export default function DongPinLayer({
  pins,
  hoveredDong,
  selectedDong,
  onPickDong,
  onHoverDong,
}: Props) {
  return (
    <>
      {pins.map((pin) => {
        if (!pin.center) return null
        const state =
          pin.id === selectedDong ? 'selected' : pin.id === hoveredDong ? 'hover' : 'default'
        return (
          <AdvancedMarker
            key={pin.id}
            position={pin.center}
            title={pin.name}
            zIndex={state === 'selected' ? 3 : state === 'hover' ? 2 : 1}
            onClick={() => onPickDong(pin.id)}
          >
            <DongPin pin={pin} state={state} onHover={onHoverDong} />
          </AdvancedMarker>
        )
      })}
    </>
  )
}
