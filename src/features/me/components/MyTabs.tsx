import Segmented from '@/components/ui/Segmented'
import type { MyTab } from '@/features/me/components/tabs'

/** 개수는 활동 요약에서 온다. 요약 조회가 실패하면 undefined → 숫자 없이 탭 이름만 */
type Props = { value: MyTab; onChange: (v: MyTab) => void; tipCount?: number; photoCount?: number }

const withCount = (label: string, n?: number) => (n === undefined ? label : `${label} ${n}`)

export default function MyTabs({ value, onChange, tipCount, photoCount }: Props) {
  return (
    <Segmented<MyTab>
      ariaLabel="마이페이지 탭"
      value={value}
      onChange={onChange}
      options={[
        { value: 'favorites', label: '내 즐겨찾기' },
        { value: 'tips', label: withCount('내 팁', tipCount) },
        { value: 'photos', label: withCount('내 사진', photoCount) },
      ]}
    />
  )
}
