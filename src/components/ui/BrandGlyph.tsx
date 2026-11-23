/** 워케이션맵 로고 글리프 (핀 + 노트북). 선 색은 currentColor. 원본: pin-laptop_glyph-24.svg */
export default function BrandGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <rect x="8.5" y="6" width="7" height="4.5" rx="1" />
      <path d="M7 13h10" />
    </svg>
  )
}
