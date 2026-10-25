import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* TODO: NavbarV2 */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
