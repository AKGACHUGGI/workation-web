import { useState } from 'react'

type Props = {
  src: string
  alt: string
  /** 크기·모서리 클래스. 로드 실패 시 같은 클래스로 회색 박스를 그린다 */
  className?: string
}

/** 사진 파일이 없거나 깨지면 깨진 이미지 아이콘 대신 같은 크기의 회색 박스(PhotoThumb 와 같은 대체 방식) */
export default function FallbackImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  if (failed)
    return <span role="img" aria-label={alt} className={`bg-bg-subtle block ${className}`} />
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />
  )
}
