/** 404. 페이지가 throw 하면 라우트 errorElement(NotFoundPage)가 그린다. mock 도 같은 에러를 던진다. */
export class NotFoundError extends Error {
  constructor(path: string) {
    super(`Not found: ${path}`)
    this.name = 'NotFoundError'
  }
}
