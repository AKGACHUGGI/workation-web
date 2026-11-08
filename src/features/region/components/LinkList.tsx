import { ExternalLink } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import { LINK_KIND_LABEL } from '@/features/region/copy'
import type { RegionLink } from '@/features/region/types'

type Props = { links: RegionLink[] }

/** 지원사업 · 숙박 · 관광 외부 링크 */
export default function LinkList({ links }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">지원사업 · 숙박 · 관광</h2>
        <span className="text-caption-xs text-text-tertiary">region_link (수동 관리)</span>
      </div>
      <ul className="border-border-default divide-border-default divide-y rounded-2xl border px-4">
        {links.map((l) => (
          <li key={l.url + l.title} className="py-3">
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Tag>{LINK_KIND_LABEL[l.kind]}</Tag>
                <span className="text-body-sm text-text-primary">{l.title}</span>
                <span className="text-caption-xs text-text-tertiary">
                  {new URL(l.url).hostname}
                </span>
              </div>
              <ExternalLink size={16} className="text-text-tertiary" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
