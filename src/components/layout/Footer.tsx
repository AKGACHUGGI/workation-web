import { Globe } from 'lucide-react'
import { FOOTER_COLUMNS } from '@/components/layout/footerLinks'

/**
 * Figma Footer (274:4885). 좌우 32 · 헤어라인 → 3단 링크(제목 16 Medium · 링크 14) → 헤어라인 →
 * 하단 바(저작권 12 / 한국어 (KR) · ₩ KRW 12 Medium)
 */
export default function Footer() {
  return (
    <footer className="min-w-desktop mt-16 flex flex-col gap-6 px-8 pb-8">
      <hr className="border-border-default" />
      <div className="flex gap-6 pt-6">
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-1 flex-col gap-2.5">
            <h2 className="text-title-md text-text-primary">{col.title}</h2>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-body-sm text-text-primary w-fit hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ))}
      </div>
      <hr className="border-border-default" />
      <div className="text-caption-xs text-text-secondary flex items-center justify-between">
        <span>© 2026 팀 아카츠키 · 기업연계캡스톤 · 이용약관 · 개인정보처리방침</span>
        <div className="text-caption-segment flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Globe size={14} aria-hidden />
            한국어 (KR)
          </span>
          <span>₩ KRW</span>
        </div>
      </div>
    </footer>
  )
}
