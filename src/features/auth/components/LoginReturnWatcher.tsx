import { useLoginReturn } from '@/features/auth/useLoginReturn'

/** AuthProvider 안에서 useLoginReturn() 만 호출한다 (컨텍스트 아래에서 훅을 쓰기 위한 빈 컴포넌트) */
export default function LoginReturnWatcher() {
  useLoginReturn()
  return null
}
