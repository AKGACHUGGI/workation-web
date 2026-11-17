import { useState } from 'react'

type Props = {
  photoUrl: string
  alt: string
  /** 사진 위 라벨 (예: '10월', '연간') */
  label?: string
  className?: string
}

/**
 * Figma PhotoThumb. 4:3 사진 + 선택적 라벨. 로드 실패 시 회색 박스.
 * 사진이 오기 전엔 스켈레톤(회색 + 반짝이는 띠)을 그리고, 도착하면 서서히 드러낸다
 */
export default function PhotoThumb({ photoUrl, alt, label, className = '' }: Props) {
  // url 별로 기억해 사진이 바뀌면 다시 스켈레톤부터 그린다
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const loaded = loadedUrl === photoUrl
  const failed = failedUrl === photoUrl
  return (
    <div
      className={`bg-bg-subtle relative aspect-[4/3] w-full overflow-hidden rounded-xl ${className}`}
    >
      {!loaded && !failed && (
        <div aria-hidden data-skeleton className="absolute inset-0">
          <div className="bg-explore-skeleton-base skeleton-shine h-full w-full" />
        </div>
      )}
      {!failed && (
        <img
          // 캐시된 사진은 onLoad 전에 이미 complete 라 바로 표시한다
          ref={(el) => {
            if (el?.complete && el.naturalWidth) setLoadedUrl(photoUrl)
          }}
          src={photoUrl}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoadedUrl(photoUrl)}
          onError={() => setFailedUrl(photoUrl)}
          className={`relative h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
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
