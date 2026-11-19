import { ExternalLink } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import DetailSection from '@/features/region/components/DetailSection'
import { LINK_FALLBACK_QUERY, LINK_KIND_LABEL, LINK_KIND_ORDER } from '@/features/region/copy'
import type { LinkKind, RegionLink } from '@/features/region/types'

type Props = {
  links: RegionLink[]
  /** 빈 상태 검색어 앞에 붙는 '시도 시군구' (예: 전라남도 여수시) */
  area: string
}

type Row = { kind: LinkKind; title: string; url: string; host: string }

const searchUrl = (q: string) =>
  `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`

/**
 * 지원사업 · 숙박 · 관광 외부 링크 (Figma 246:2678: 행 높이 60 · 간격 16 · 제목 위 도메인 아래).
 * region_link(수동 입력)가 아직 비어 있는 지역은 안내 문구와 외부 검색 링크로 대신한다.
 */
export default function LinkList({ links, area }: Props) {
  const empty = links.length === 0
  const rows: Row[] = empty
    ? LINK_KIND_ORDER.map((kind) => {
        const q = `${area} ${LINK_FALLBACK_QUERY[kind]}`
        return { kind, title: `${q} 검색`, url: searchUrl(q), host: '네이버 검색' }
      })
    : [...links]
        .sort((a, b) => LINK_KIND_ORDER.indexOf(a.kind) - LINK_KIND_ORDER.indexOf(b.kind))
        .map((l) => ({ ...l, host: new URL(l.url).hostname }))

  return (
    <DetailSection title="지원사업 · 숙박 · 관광">
      {empty && (
        <p className="text-body-sm text-text-secondary">
          아직 등록된 지원사업·숙박·관광 정보가 없어요. 아래 검색으로 먼저 찾아보세요.
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {rows.map((l) => (
          <li key={l.url + l.title}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-15 items-center gap-3"
            >
              <Tag>{LINK_KIND_LABEL[l.kind]}</Tag>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-sm text-text-primary group-hover:underline">
                  {l.title}
                </span>
                <span className="text-caption-xs text-text-tertiary">{l.host}</span>
              </span>
              <ExternalLink size={16} aria-hidden className="text-text-secondary shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </DetailSection>
  )
}
