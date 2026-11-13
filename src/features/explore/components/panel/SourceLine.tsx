type Props = { children: string }

/** 패널 맨 아래 출처 줄 (Figma 436:10616, 434:9888). mt-auto 로 패널 바닥에 붙는다 */
export default function SourceLine({ children }: Props) {
  return (
    <p className="text-explore-2xs text-text-tertiary mt-auto shrink-0 pt-3 pb-4">{children}</p>
  )
}
