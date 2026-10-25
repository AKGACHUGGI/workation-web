import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <Link to="/" className="mt-4 inline-block underline">
        홈으로
      </Link>
    </section>
  )
}
