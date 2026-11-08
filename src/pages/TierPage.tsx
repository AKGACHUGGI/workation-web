import PageContainer from '@/components/layout/PageContainer'
import { useMonthParam } from '@/hooks/useQueryState'

/** W-02 티어리스트. W-02 플랜에서 본문을 채운다. */
export default function TierPage() {
  const [month] = useMonthParam()
  return (
    <PageContainer className="py-10">
      <h1 className="text-heading-2xl text-text-primary">티어리스트</h1>
      <p className="text-body-sm text-text-secondary mt-2">기준 월: {month}</p>
    </PageContainer>
  )
}
