import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import { useAuthContext } from '@/features/auth/authContext'
import { useAuth } from '@/features/auth/useAuth'
import AccountSection from '@/features/me/components/AccountSection'
import FavoriteDongs from '@/features/me/components/FavoriteDongs'
import FavoriteRegions from '@/features/me/components/FavoriteRegions'
import FavoritesEmpty from '@/features/me/components/FavoritesEmpty'
import MyPhotos from '@/features/me/components/MyPhotos'
import MySkeleton from '@/features/me/components/MySkeleton'
import MyTabs from '@/features/me/components/MyTabs'
import MyTips from '@/features/me/components/MyTips'
import NotificationSettings from '@/features/me/components/NotificationSettings'
import ProfileHeader from '@/features/me/components/ProfileHeader'
import SyncNote from '@/features/me/components/SyncNote'
import { DEFAULT_MY_TAB, parseMyTab } from '@/features/me/components/tabs'
import type { MyTab } from '@/features/me/components/tabs'
import { useMeSummary } from '@/features/me/useMeSummary'
import { useMyFavorites } from '@/features/me/useMyFavorites'
import { parseMetrics } from '@/features/metric/params'
import { useMonthParam, usePresetParam, useQueryState } from '@/hooks/useQueryState'

/** W-08 마이페이지 (로그인 필수) */
export default function MyPage() {
  const { me, isPending: authPending, isLoggedIn } = useAuth()
  const { openLogin } = useAuthContext()
  const navigate = useNavigate()
  const [tab, setTab] = useQueryState<MyTab>('tab', parseMyTab, DEFAULT_MY_TAB)
  const [month] = useMonthParam()
  const [preset] = usePresetParam()
  // 읽기 전용(카드 링크로 넘기기만 함). useQueryState 는 무효 값을 기본값 String(null) = 'null' 로 보정하므로 쓰지 않는다
  const [searchParams] = useSearchParams()
  const metrics = parseMetrics(searchParams.get('metrics'))

  // 비로그인: 모달을 열고, 로그인 없이 닫히면 홈으로
  useEffect(() => {
    if (authPending || isLoggedIn) return
    openLogin(undefined, { onDismiss: () => navigate('/', { replace: true }) })
  }, [authPending, isLoggedIn, openLogin, navigate])

  const summary = useMeSummary()
  const favorites = useMyFavorites(month)

  if (authPending || !isLoggedIn || !me) {
    return (
      <PageContainer className="py-10">
        <h1 className="sr-only">마이페이지</h1>
      </PageContainer>
    )
  }
  if (summary.isPending) {
    return (
      <PageContainer className="py-10">
        <MySkeleton />
      </PageContainer>
    )
  }
  // 요약 실패는 페이지 전체가 아니라 섹션 단위로 (스펙 §8): 헤더 요약 줄만 에러, 탭 숫자·계정 '데이터' 줄 생략
  const summaryData = summary.data

  const fav = favorites.data
  const favEmpty = fav && fav.regions.length === 0 && fav.dongs.length === 0

  return (
    <PageContainer className="flex flex-col gap-6 py-8">
      <ProfileHeader me={me} summary={summaryData} onRetrySummary={() => summary.refetch()} />
      <MyTabs
        value={tab}
        onChange={setTab}
        tipCount={summaryData?.tipCount}
        photoCount={summaryData?.photoCount}
      />
      {/* Figma: 본문 952 + 간격 24 + 사이드 400 */}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {tab === 'favorites' &&
            (favorites.isPending ? (
              <div className="bg-bg-subtle h-64 animate-pulse rounded-xl" />
            ) : favorites.isError || !fav ? (
              <p className="text-body-sm text-text-secondary">
                불러오지 못했습니다 ·{' '}
                <button type="button" onClick={() => favorites.refetch()} className="underline">
                  다시 시도
                </button>
              </p>
            ) : favEmpty ? (
              <FavoritesEmpty />
            ) : (
              <>
                {fav.regions.length > 0 && (
                  <FavoriteRegions
                    regions={fav.regions}
                    month={month}
                    preset={preset}
                    metrics={metrics}
                  />
                )}
                {fav.dongs.length > 0 && <FavoriteDongs dongs={fav.dongs} />}
              </>
            ))}
          {tab === 'tips' && <MyTips />}
          {tab === 'photos' && <MyPhotos />}
        </div>
        <aside className="flex w-100 shrink-0 flex-col gap-6">
          <NotificationSettings />
          <AccountSection me={me} summary={summaryData} />
          <SyncNote />
        </aside>
      </div>
    </PageContainer>
  )
}
