import { useEffect, useRef, useState } from 'react'
import { Bookmark } from 'lucide-react'
import PopIcon from '@/components/ui/PopIcon'
import ShareFlowIcon from '@/components/ui/ShareFlowIcon'
import { usePopOnTrue } from '@/hooks/usePopOnTrue'

/** 공유 아이콘이 차 있는 시간 — 세 원이 위→아래로 다 차오른(약 0.6초) 뒤 잠깐 머물다 빠진다 */
const SHARE_LIT_MS = 1100

type Props = {
  favorite: boolean
  onFavorite: () => void
  onShare: () => void
  /** 스크린리더 이름. 보이는 글자는 항상 '즐겨찾기' ('이 지역 즐겨찾기' · '이 동네 즐겨찾기') */
  favoriteLabel: string
}

/**
 * 계획 카드 버튼 묶음 (지역 PlanCard · 동네 DongPlanCard 공용): 즐겨찾기 · 공유하기 · 동기화 안내.
 * 즐겨찾기는 문구를 바꾸지 않고 북마크만 노랗게 채워지며 반짝, 공유는 반짝이면서 원이 위→아래로 차오른다
 */
export default function PlanActions({ favorite, onFavorite, onShare, favoriteLabel }: Props) {
  // 즐겨찾기는 로그인 모달을 거칠 수 있어 클릭이 아니라 favorite 이 켜지는 순간 반짝인다
  const favoritePop = usePopOnTrue(favorite)
  const [shareLit, setShareLit] = useState(false)
  const [sharePop, setSharePop] = useState(0)
  const shareTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => shareTimers.current.forEach(clearTimeout), [])
  const handleShare = () => {
    shareTimers.current.forEach(clearTimeout)
    // 누르는 순간 반짝이며 동시에 위 원부터 물이 흘러내린다
    setShareLit(true)
    setSharePop((n) => n + 1)
    shareTimers.current = [setTimeout(() => setShareLit(false), SHARE_LIT_MS)]
    onShare()
  }
  return (
    <>
      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={favorite}
        aria-label={favoriteLabel}
        className="bg-brand-primary text-body-base text-text-on-brand hover:bg-brand-hover flex h-12 items-center justify-center gap-2 rounded-lg px-6 font-medium"
      >
        <PopIcon pop={favoritePop} className={favorite ? 'text-accent-favorite' : ''}>
          <Bookmark
            size={18}
            aria-hidden
            className={`transition-[color,fill] duration-200 ${favorite ? 'fill-accent-favorite' : ''}`}
          />
        </PopIcon>
        즐겨찾기
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="border-text-primary bg-bg-surface text-body-base text-text-primary hover:bg-bg-subtle flex h-12 items-center justify-center gap-2 rounded-lg border px-6 font-medium"
      >
        <PopIcon pop={sharePop}>
          <ShareFlowIcon lit={shareLit} />
        </PopIcon>
        공유하기
      </button>
      <p className="text-caption-xs text-text-tertiary text-center">
        즐겨찾기는 로그인 시 기기 간 동기화돼요
      </p>
    </>
  )
}
