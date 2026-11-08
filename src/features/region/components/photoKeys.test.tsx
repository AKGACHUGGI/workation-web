import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import PhotoGallery from '@/features/region/components/PhotoGallery'
import PollSection from '@/features/region/components/PollSection'

/** mock 사진은 같은 URL 이 여러 장 들어온다. URL 만으로 key 를 쓰면 React 가 중복 key 경고를 낸다 */
const SAME = '/mock-photos/51820.jpg'

function duplicateKeyErrors(calls: unknown[][]) {
  return calls.filter((args) => String(args[0]).includes('same key'))
}

describe('사진 목록 key', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('PhotoGallery·PhotoGalleryModal: 같은 URL 사진이 여러 장이어도 중복 key 경고가 없다', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const photos = Array.from({ length: 6 }, () => ({ url: SAME }))
    render(<PhotoGallery photos={photos} alt="고성군" />)
    expect(duplicateKeyErrors(spy.mock.calls)).toEqual([])
  })

  it('PollSection: 같은 URL 이달의 사진이 여러 장이어도 중복 key 경고가 없다', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderWithRouter(
      <PollSection
        question="조용했나요?"
        data={{
          question: '조용했나요?',
          yes: 3,
          no: 1,
          total: 4,
          photos: Array.from({ length: 3 }, (_, i) => ({ url: SAME, author: `사용자${i}` })),
        }}
        status="success"
        onRetry={() => {}}
        participationLabel="지표 검증에 반영돼요"
      />,
    )
    expect(duplicateKeyErrors(spy.mock.calls)).toEqual([])
  })
})
