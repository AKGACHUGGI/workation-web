import type { Me } from '@/features/auth/types'

type Props = { me: Me }

export default function OnboardingModal({ me }: Props) {
  return <div hidden data-onboarding-for={me.id} />
}
