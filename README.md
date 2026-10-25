# workation-web

워케이션(가제) 웹 (React + Tailwind CSS).
LG U+ 유동/서비스인구 데이터를 기반으로 워케이션 지역·시기·동네를 추천하는 서비스의 웹 클라이언트입니다.

## 관련 레포

- 백엔드: [workation-backend](https://github.com/TEAM-SKPJC/workation-backend)
- 모바일 앱: [workation-mobile](https://github.com/TEAM-SKPJC/workation-mobile) (Flutter)

## 스택

| 항목 | 선택 |
| --- | --- |
| 빌드 | Vite 8 |
| UI | React 19 + TypeScript 6 |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme`) |
| 라우팅 | react-router-dom v7 |
| 린트 / 포맷 | oxlint / Prettier (+ tailwind 플러그인) |
| Node | 22 이상 (`.nvmrc` = 26) |

인증·DB는 백엔드(workation-backend)가 담당합니다. 프론트는 `VITE_API_BASE_URL` 로 백엔드 API만 호출합니다.

## 시작하기

```bash
cp .env.example .env   # API 주소 설정
npm install
npm run dev
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run lint` | oxlint |
| `npm run format` | Prettier 전체 포맷 |

## 폴더 구조

```
src/
  pages/        화면 단위 (명세서 W-01~W-06 과 1:1)
  components/   공용 UI (RootLayout, NavbarV2 등)
  features/     도메인별 묶음 (API 호출 + 상태 + 전용 컴포넌트)
  lib/          api.ts 등 유틸
  hooks/        공용 훅
  types/        공용 타입
  assets/       이미지·폰트
  router.tsx    라우트 등록
  index.css     Tailwind 진입점 + @theme 디자인 토큰
```

`@/` 는 `src/` 의 별칭입니다.

## 디자인

- 디자인 토큰은 `src/index.css` 의 `@theme` 에 정의하며, `docs/디자인-원칙.md` 와 Figma Foundations 기준으로 교체 예정
- 색상은 semantic 토큰(bg/text/brand/grade/signal/chart/heat)만 사용
