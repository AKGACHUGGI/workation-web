import { useCallback, useRef, useState } from 'react'
import { useToast } from '@/components/ui/toast/useToast'
import { fetchReportPdf } from '@/features/report/api'
import { PDF_FAIL_MESSAGE, reportFileName } from '@/features/report/copy'
import type { ReportPreset } from '@/features/report/types'

type Params = { year: number; preset: ReportPreset; name: string }

/** object URL 해제 지연 (다운로드 시작 뒤) */
const REVOKE_DELAY_MS = 1000

/**
 * PDF 내보내기. blob → object URL → <a download> 클릭 → (지연 후) URL 해제.
 * 진행 중에는 재호출을 무시한다 (버튼은 isPending 으로 비활성).
 */
export function useReportPdf(id: string, { year, preset, name }: Params) {
  const [isPending, setPending] = useState(false)
  const pendingRef = useRef(false)
  const { show } = useToast()

  const download = useCallback(async () => {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    try {
      const blob = await fetchReportPdf(id, { year, preset })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = reportFileName(name, year)
      document.body.appendChild(a)
      a.click()
      a.remove()
      // 클릭 직후 바로 해제하면 Safari·Firefox 가 다운로드를 시작하기 전에 URL 이 사라질 수 있어 늦춘다
      setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
    } catch {
      show(PDF_FAIL_MESSAGE)
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }, [id, year, preset, name, show])

  return { download, isPending }
}
