import { ExternalLink } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import DetailSection from '@/features/region/components/DetailSection'
import { LINK_KIND_LABEL } from '@/features/region/copy'
import type { RegionLink } from '@/features/region/types'

type Props = { links: RegionLink[] }

/** 지원사업 · 숙박 · 관광 외부 링크 (Figma 246:2678: 행 높이 60 · 간격 16 · 제목 위 도메인 아래) */
export default function LinkList({ links }: Props) {
  return (
    <DetailSection title="지원사업 · 숙박 · 관광" caption="region_link (수동 관리)">
      <ul className="flex flex-col gap-4">
        {links.map((l) => (
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
                <span className="text-caption-xs text-text-tertiary">
                  {new URL(l.url).hostname}
                </span>
              </span>
              <ExternalLink size={16} aria-hidden className="text-text-secondary shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </DetailSection>
  )
}
