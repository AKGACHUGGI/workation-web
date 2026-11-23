import { Globe } from 'lucide-react'

/**
 * Figma Footer (274:4885) 에서 3단 링크를 뺀 형태. 좌우 32 · 헤어라인 →
 * 하단 바(저작권 12 / 한국어 (KR) · ₩ KRW 12 Medium)
 */
export default function Footer() {
  return (
    <footer className="min-w-desktop mt-16 flex flex-col gap-6 px-8 pb-8">
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
