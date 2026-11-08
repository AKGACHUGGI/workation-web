import ExampleChips from '@/features/search/components/ExampleChips'
import SearchBar from '@/features/search/components/SearchBar'

const NO_RESULT = '조건을 찾지 못했어요. 예시처럼 시기 · 분위기 · 동네를 적어보세요'

type Props = {
  q: string
  pending: boolean
  noResult: boolean
  onSubmit: (text: string) => void
}

/**
 * Figma Hero(274:4705): 가운데 정렬 · 위 40 · 간격 20. 제목 24 Bold · 설명 14 보조색 · 검색 필 · 예시 칩.
 * 검색 상태는 HomePage 의 useSearchIntent 가 들고, "AI가 이해한 조건" 줄은 결과 머리에 있다.
 */
export default function SearchSection({ q, pending, noResult, onSubmit }: Props) {
  return (
    <section className="flex flex-col items-center gap-5 pt-10 pb-1">
      <h1 className="text-heading-2xl text-text-primary">어떤 워케이션을 찾고 있나요?</h1>
      <p className="text-body-sm text-text-secondary">
        원하는 시기 · 분위기 · 동네를 문장으로 적어보세요. LG U+ 유동·서비스인구 데이터로 12개
        시군구 중 맞는 지역을 AI가 추천합니다.
      </p>
      <SearchBar key={q} initial={q} pending={pending} onSubmit={onSubmit} />
      <ExampleChips onPick={onSubmit} />
      {noResult && <p className="text-body-sm text-text-secondary">{NO_RESULT}</p>}
    </section>
  )
}
