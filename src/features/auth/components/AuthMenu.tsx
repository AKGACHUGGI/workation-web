import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/toast/useToast'
import { logout } from '@/features/auth/api'
import { useAuthContext } from '@/features/auth/authContext'
import { authKeys } from '@/features/auth/queryKeys'
import { useAuth } from '@/features/auth/useAuth'

/** Navbar 우측. 비로그인: 로그인 버튼 → 모달. 로그인: 아바타 → 마이페이지 · 로그아웃 */
export default function AuthMenu() {
  const { me, isPending } = useAuth()
  const { openLogin } = useAuthContext()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { show } = useToast()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signOut = useMutation({
    mutationFn: logout,
    onSettled: () => {
      setOpen(false)
      // /me 에서 로그아웃할 때 MyPage 가 비로그인으로 재렌더되기 전에 먼저 떠난다
      navigate('/')
      queryClient.setQueryData(authKeys.me, null)
      // W-08 meKeys.all(['me']) 캐시 비우기. features/auth 는 features/me 를 import 하지 않으므로 키를 직접 쓴다
      queryClient.removeQueries({ queryKey: ['me'] })
      show('로그아웃했습니다')
    },
  })

  if (isPending) return <div aria-hidden="true" className="h-10 w-20" />

  if (!me) {
    return (
      <button
        type="button"
        onClick={() => openLogin()}
        className="border-border-default text-body-sm text-text-primary hover:border-border-strong rounded-lg border px-4 py-2"
      >
        로그인
      </button>
    )
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={`${me.nickname} 메뉴`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full"
      >
        <Avatar initial={me.initial} />
      </button>
      {open && (
        <div
          role="menu"
          className="border-border-default bg-bg-surface shadow-float absolute top-12 right-0 flex w-40 flex-col rounded-xl border p-1"
        >
          <Link
            role="menuitem"
            to="/me"
            onClick={() => setOpen(false)}
            className="text-body-sm text-text-primary hover:bg-bg-subtle rounded-lg px-3 py-2"
          >
            마이페이지
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
            className="text-body-sm text-text-primary hover:bg-bg-subtle rounded-lg px-3 py-2 text-left"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
