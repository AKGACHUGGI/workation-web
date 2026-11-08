import { Outlet } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import ToastProvider from '@/components/ui/toast/ToastProvider'
import AuthProvider from '@/features/auth/AuthProvider'

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}
