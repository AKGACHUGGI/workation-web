import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import { useToast } from '@/components/ui/toast/useToast'
import { patchMe } from '@/features/auth/api'
import { authKeys } from '@/features/auth/queryKeys'
import { PROVIDER_LABEL } from '@/features/auth/types'
import type { Me } from '@/features/auth/types'
import NicknameEditor from '@/features/me/components/NicknameEditor'
import { ME_COPY } from '@/features/me/copy'
import { buildActivitySummary } from '@/features/me/summary'
import type { MeSummary } from '@/features/me/types'

/** summary 가 없으면(조회 실패) 요약 줄만 섹션 에러로 바꾼다 (스펙 §8 섹션 단위 에러) */
type Props = { me: Me; summary?: MeSummary; onRetrySummary?: () => void }

export default function ProfileHeader({ me, summary, onRetrySummary }: Props) {
  const [editing, setEditing] = useState(false)
  const queryClient = useQueryClient()
  const { show } = useToast()

  async function save(nickname: string) {
    try {
      const next = await patchMe({ nickname })
      queryClient.setQueryData(authKeys.me, next)
      setEditing(false)
    } catch {
      show(ME_COPY.nicknameFailed) // 편집 상태 유지 → 다시 저장 가능
    }
  }

  return (
    <section className="border-border-default bg-bg-surface flex items-center justify-between gap-5 rounded-2xl border p-6">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <Avatar initial={me.initial} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            {editing ? (
              <NicknameEditor
                initial={me.nickname}
                onSave={save}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <h1 className="text-heading-2xl text-text-primary">{me.nickname}</h1>
            )}
            <Tag>{PROVIDER_LABEL[me.provider]} 연결됨</Tag>
          </div>
          {summary ? (
            <p className="text-body-sm text-text-secondary">{buildActivitySummary(summary)}</p>
          ) : (
            <p className="text-body-sm text-text-secondary">
              {ME_COPY.summaryFailed} ·{' '}
              <button type="button" onClick={onRetrySummary} className="underline">
                다시 시도
              </button>
            </p>
          )}
        </div>
      </div>
      {!editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="border-text-primary bg-bg-surface text-body-base text-text-primary h-10 shrink-0 rounded-lg border px-6 font-medium"
        >
          프로필 편집
        </button>
      )}
    </section>
  )
}
