/** 로그인 후 돌아올 곳. path+query 만 (origin 은 signIn 이 붙인다). login=1 로 복귀를 표시 */
export function buildReturnTo(pathname: string, search: string): string {
  const params = new URLSearchParams(search)
  params.delete('login')
  params.delete('reason')
  params.set('login', '1')
  return `${pathname}?${params.toString()}`
}
