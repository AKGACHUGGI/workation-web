import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/components/RootLayout'
import ComparePage from '@/pages/ComparePage'
import DongProfilePage from '@/pages/DongProfilePage'
import HomePage from '@/pages/HomePage'
import MyPage from '@/pages/MyPage'
import NotFoundPage from '@/pages/NotFoundPage'
import RegionDetailPage from '@/pages/RegionDetailPage'
import TierPage from '@/pages/TierPage'

// 화면 ID(W-01~W-08)는 공통 기반 스펙 §2 기준. 경로를 바꾸면 스펙 §2 표도 함께 고친다.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> }, // W-01
      { path: 'tier', element: <TierPage /> }, // W-02
      { path: 'regions/:sggId', element: <RegionDetailPage />, errorElement: <NotFoundPage /> }, // W-03
      { path: 'dongs/:dongId', element: <DongProfilePage />, errorElement: <NotFoundPage /> }, // W-04
      { path: 'compare', element: <ComparePage /> }, // W-05
      // { path: 'reports/:sggId' }  W-06 플랜에서 추가
      { path: 'me', element: <MyPage /> }, // W-08
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
