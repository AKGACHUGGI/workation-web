import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useReportPdf } from '@/features/report/useReportPdf'

const fetchReportPdf = vi.fn()
vi.mock('@/features/report/api', () => ({
  fetchReportPdf: (...a: unknown[]) => fetchReportPdf(...a),
}))

const show = vi.fn()
vi.mock('@/components/ui/toast/useToast', () => ({ useToast: () => ({ show }) }))

let clickSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  fetchReportPdf.mockReset()
  show.mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
  clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterEach(() => {
  clickSpy.mockRestore()
  vi.useRealTimers()
})

const params = { year: 2025, preset: 'quiet' as const, name: '고성군' }

describe('useReportPdf', () => {
  it('blob 을 받아 {name}_진단리포트_{year}.pdf 로 내려받고, 클릭 뒤 지연해서 URL 을 해제한다', async () => {
    vi.useFakeTimers() // 해제 지연(setTimeout)만 확인. 다른 테스트는 waitFor 때문에 실제 타이머
    fetchReportPdf.mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }))
    const { result } = renderHook(() => useReportPdf('51820', params))

    await act(() => result.current.download())

    expect(fetchReportPdf).toHaveBeenCalledWith('51820', { year: 2025, preset: 'quiet' })
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement
    expect(anchor.download).toBe('고성군_진단리포트_2025.pdf')
    expect(anchor.href).toContain('blob:mock')
    expect(URL.revokeObjectURL).not.toHaveBeenCalled() // 클릭 직후 해제하면 일부 브라우저가 다운로드를 취소한다
    vi.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
    expect(show).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(false)
  })

  it('실패하면 토스트', async () => {
    fetchReportPdf.mockRejectedValue(new Error('500'))
    const { result } = renderHook(() => useReportPdf('51820', params))
    await act(() => result.current.download())
    expect(show).toHaveBeenCalledWith('PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요')
    expect(clickSpy).not.toHaveBeenCalled()
  })

  it('진행 중 중복 호출은 무시한다', async () => {
    let resolve!: (b: Blob) => void
    fetchReportPdf.mockReturnValue(new Promise<Blob>((r) => (resolve = r)))
    const { result } = renderHook(() => useReportPdf('51820', params))

    act(() => {
      void result.current.download()
    })
    await waitFor(() => expect(result.current.isPending).toBe(true))
    act(() => {
      void result.current.download()
    })
    expect(fetchReportPdf).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolve(new Blob())
    })
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })
})
