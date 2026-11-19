import { useCallback, useEffect, useRef, useState } from 'react'

export type PickedPhoto = { id: string; file: File; previewUrl: string }

type Options = { max?: number; maxSizeMb?: number; onReject?: (reason: string) => void }

/**
 * 사진 선택·미리보기 (UI 만). 업로드는 나중에 Cloudflare R2 presigned URL 로 붙인다:
 * POST /api/uploads/presign → PUT 원본 → 받은 key 를 글·사진 등록 API 에 넘기는 흐름.
 * inputProps 를 숨긴 <input type="file"> 에 펼치고 open() 으로 연다.
 */
export function usePhotoPicker({ max = 4, maxSizeMb = 10, onReject }: Options = {}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PickedPhoto[]>([])

  // 언마운트 시 미리보기 URL 해제
  const photosRef = useRef(photos)
  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)), [])

  const open = useCallback(() => inputRef.current?.click(), [])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      e.target.value = ''
      // 검증·토스트는 updater 밖에서 (StrictMode 이중 호출로 토스트가 두 번 뜨지 않게)
      const room = max - photosRef.current.length
      const ok = files.filter((f) => {
        if (!f.type.startsWith('image/')) return (onReject?.('이미지 파일만 올릴 수 있어요'), false)
        if (f.size > maxSizeMb * 1024 * 1024)
          return (onReject?.(`${maxSizeMb}MB 이하 사진만 올릴 수 있어요`), false)
        return true
      })
      if (ok.length > room) onReject?.(`사진은 ${max}장까지 올릴 수 있어요`)
      const added = ok.slice(0, Math.max(room, 0)).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      if (added.length) setPhotos((prev) => [...prev, ...added])
    },
    [max, maxSizeMb, onReject],
  )

  const remove = useCallback((id: string) => {
    setPhotos((prev) => {
      const hit = prev.find((p) => p.id === id)
      if (hit) URL.revokeObjectURL(hit.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  const clear = useCallback(() => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      return []
    })
  }, [])

  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    accept: 'image/*',
    multiple: max > 1,
    hidden: true,
    onChange,
  }

  return { photos, open, remove, clear, inputProps }
}
