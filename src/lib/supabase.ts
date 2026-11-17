import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isMock } from '@/lib/mock'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase Auth 클라이언트. 로그인·토큰 저장·갱신을 맡는다(토큰은 localStorage).
 * mock 모드이거나 키가 없으면 null → 비로그인으로만 동작한다.
 */
export const supabase: SupabaseClient | null =
  !isMock && url && anonKey ? createClient(url, anonKey, { auth: { flowType: 'pkce' } }) : null

/** 현재 access token. OAuth 복귀(?code=) 교환이 끝날 때까지 기다린다 */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
