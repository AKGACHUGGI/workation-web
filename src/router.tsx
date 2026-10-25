import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/components/RootLayout'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

// 화면 ID(W-01~W-06)는 명세서 기준. 화면 추가 시 여기에 라우트를 등록합니다.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> }, // W-01
    ],
  },
])
