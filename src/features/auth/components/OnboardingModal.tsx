import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Checkbox from '@/components/ui/Checkbox'
import { MonthWheel } from '@/components/ui/MonthPicker'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/TextField'
import { useToast } from '@/components/ui/toast/useToast'
import { AGE_GROUPS, AGE_GROUP_LABEL } from '@/features/auth/ageGroup'
import type { AgeGroup } from '@/features/auth/ageGroup'
import { logout, patchMe } from '@/features/auth/api'
import { useAuthContext } from '@/features/auth/authContext'
import { NICKNAME_MAX, validateNickname } from '@/features/auth/nickname'
import { authKeys } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

type Props = { me: Me }

const AGE_LABELS = AGE_GROUPS.map((g) => AGE_GROUP_LABEL[g])
/** 휠이 처음 가운데에 두는 연령대(선택 표시는 없다) */
const AGE_START_INDEX = AGE_GROUPS.indexOf('30s')

/** 첫 로그인: 닉네임 + 연령대(필수) + 약관 2개. 닫으면 약관 미동의 세션을 남기지 않기 위해 로그아웃한다. Figma 시안 없음(열린 항목) */
export default function OnboardingModal({ me }: Props) {
  const queryClient = useQueryClient()
  const { show } = useToast()
  const { closeLogin } = useAuthContext()
  const [nickname, setNickname] = useState(me.nickname)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
  const error = validateNickname(nickname)
  const canSubmit = !error && ageGroup !== null && terms && privacy

  const submit = useMutation({
    mutationFn: (age: AgeGroup) =>
      patchMe({ nickname: nickname.trim(), agreedAt: new Date().toISOString(), ageGroup: age }),
    onSuccess: (next) => queryClient.setQueryData(authKeys.me, next),
    onError: () => show('저장하지 못했습니다. 다시 시도해 주세요'),
  })

  const cancel = useMutation({
    mutationFn: logout,
    onSettled: () => {
      // 로그인 모달은 me 가 생겨 가려졌을 뿐 isOpen=true 로 남아 있다. me=null 이 되면 다시 뜨므로 먼저 닫는다
      // (보류 동작 폐기 + onDismiss 호출 — 사용자가 로그인을 그만둔 것)
      closeLogin()
      queryClient.setQueryData(authKeys.me, null)
      show('약관에 동의해야 이용할 수 있어요')
    },
  })

  const busy = submit.isPending || cancel.isPending

  return (
    <Modal open onClose={() => !busy && cancel.mutate()} titleId="onboarding-title" width="sm">
      <h2 id="onboarding-title" className="text-heading-xl text-text-primary">
        거의 다 됐어요
      </h2>
      <p className="text-body-sm text-text-secondary mt-2">
        닉네임과 연령대를 정하고 약관에 동의하면 바로 시작할 수 있어요.
      </p>
      <div className="mt-6">
        <TextField
          id="onboarding-nickname"
          label="닉네임"
          value={nickname}
          onChange={setNickname}
          maxLength={NICKNAME_MAX}
          error={error ?? undefined}
          hint="2~12자 · 공개"
          autoFocus
        />
      </div>
      <div className="mt-4">
        <p id="onboarding-age-label" className="text-body-sm text-text-primary mb-2 font-medium">
          연령대
        </p>
        <MonthWheel
          labels={AGE_LABELS}
          index={ageGroup === null ? AGE_START_INDEX : AGE_GROUPS.indexOf(ageGroup)}
          onIndex={(i) => setAgeGroup(AGE_GROUPS[i])}
          ariaLabel="연령대"
          idPrefix="age-option"
          selected={ageGroup !== null}
        />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Checkbox
          id="onboarding-terms"
          checked={terms}
          onChange={setTerms}
          label={
            <>
              <a href="/terms" target="_blank" rel="noopener" className="underline">
                이용약관
              </a>
              에 동의합니다
            </>
          }
        />
        <Checkbox
          id="onboarding-privacy"
          checked={privacy}
          onChange={setPrivacy}
          label={
            <>
              <a href="/privacy" target="_blank" rel="noopener" className="underline">
                개인정보 처리방침
              </a>
              에 동의합니다
            </>
          }
        />
      </div>
      <button
        type="button"
        disabled={!canSubmit || busy}
        onClick={() => ageGroup && submit.mutate(ageGroup)}
        className="bg-brand-primary text-body-base text-text-on-brand hover:bg-brand-hover disabled:opacity-dim mt-6 h-12 w-full rounded-lg font-medium disabled:cursor-not-allowed"
      >
        시작하기
      </button>
    </Modal>
  )
}
