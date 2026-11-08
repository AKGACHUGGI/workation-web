/** 404. 페이지가 throw 하면 라우트 errorElement(NotFoundPage)가 그린다. mock 도 같은 에러를 던진다. */
export class NotFoundError extends Error {
  constructor(path: string) {
    super(`Not found: ${path}`)
    this.name = 'NotFoundError'
  }
}

/** 401. 세션 없음·만료. useAuth 는 null 로, 뮤테이션은 AuthProvider 가 로그인 모달로 바꾼다 */
export class UnauthorizedError extends Error {
  constructor(path: string) {
    super(`API 401: ${path}`)
    this.name = 'UnauthorizedError'
  }
}
