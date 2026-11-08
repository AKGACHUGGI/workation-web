import { useState } from 'react'

type Props = {
  photoUrl: string
  alt: string
  /** 사진 위 라벨 (예: '10월', '연간') */
  label?: string
  className?: string
}

/** Figma PhotoThumb. 4:3 사진 + 선택적 라벨. 로드 실패 시 회색 박스 */
export default function PhotoThumb({ photoUrl, alt, label, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`bg-bg-subtle relative aspect-[4/3] w-full overflow-hidden rounded-xl ${className}`}
    >
      {!failed && (
        <img
          src={photoUrl}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
      {label && (
        // Figma ListingCard FloatBadge: 흰 pill · 11/13 Bold · card-float 그림자, 사진 안쪽 12px
        <span className="bg-bg-surface text-caption-badge text-text-primary shadow-float absolute top-3 left-3 rounded-full px-2.5 py-1">
          {label}
        </span>
      )}
    </div>
  )
}
