import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/toast/useToast'
import { deleteMe, logout } from '@/features/auth/api'
import { PROVIDER_LABEL } from '@/features/auth/types'
import type { Me } from '@/features/auth/types'
import MePanel from '@/features/me/components/MePanel'
import { ME_COPY } from '@/features/me/copy'
import type { MeSummary } from '@/features/me/types'

type Props = { me: Me; summary?: MeSummary }

/** Figma Button ghost (h-10): 잉크 글자, hover 밑줄 */
const GHOST =
  'text-body-base text-text-primary disabled:opacity-dim h-10 rounded-lg px-6 font-medium hover:underline'

export default function AccountSection({ me, summary }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { show } = useToast()

  async function handleLogout() {
    setBusy(true)
    try {
      await logout()
      navigate('/') // 먼저 /me 를 떠나야 MyPage 가 비로그인 모달을 다시 열지 않는다
      queryClient.clear()
      show(ME_COPY.loggedOut)
    } catch {
      show(ME_COPY.logoutFailed)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteMe()
      setConfirming(false)
      navigate('/')
      queryClient.clear()
      show(ME_COPY.accountDeleted)
    } catch {
      show(ME_COPY.accountDeleteFailed) // 확인 모달은 열어 둬 다시 시도할 수 있게
    } finally {
      setBusy(false)
    }
  }

  const rows: [string, string][] = [
    ['로그인 방식', `${PROVIDER_LABEL[me.provider]} (연결됨)`],
    ['이메일', `${me.emailMasked} · 비공개`],
    ['닉네임', `${me.nickname} · 공개`],
  ]
  if (summary) {
    rows.push([
      '데이터',
      `즐겨찾기 ${summary.favoriteCount} · 팁 ${summary.tipCount} · 사진 ${summary.photoCount} · 투표 ${summary.voteCount}`,
    ])
  }

  return (
    <MePanel title="계정">
      <dl className="flex flex-col gap-4">
        {rows.map(([k, v]) => (
          <div key={k} className="text-body-sm flex justify-between gap-4">
            <dt className="text-text-secondary shrink-0">{k}</dt>
            <dd className="text-text-primary text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2">
        <button type="button" onClick={handleLogout} disabled={busy} className={GHOST}>
          로그아웃
        </button>
        <button type="button" onClick={() => setConfirming(true)} disabled={busy} className={GHOST}>
          계정 삭제
        </button>
      </div>
      <ConfirmModal
        open={confirming}
        title="계정을 삭제할까요?"
        description={ME_COPY.deleteAccount}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
        danger
        pending={busy}
      />
    </MePanel>
  )
}
