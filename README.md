# workation-web

[![CI](https://github.com/TEAM-SKPJC/workation-web/actions/workflows/ci.yml/badge.svg)](https://github.com/TEAM-SKPJC/workation-web/actions/workflows/ci.yml)

워케이션(가제) 웹 클라이언트. LG U+ 유동/서비스인구 데이터를 기반으로 워케이션 지역·시기·동네를 추천하는 서비스입니다.

- 백엔드: [workation-backend](https://github.com/TEAM-SKPJC/workation-backend)
- 모바일 앱: [workation-mobile](https://github.com/TEAM-SKPJC/workation-mobile) (Flutter)
- 팀 문서: [workation-docs](https://github.com/TEAM-SKPJC/workation-docs) (명세서 · 디자인 원칙 · [협업 규칙](https://github.com/TEAM-SKPJC/workation-docs/blob/main/협업/협업-규칙.md))
- 디자인: [Figma 기업연계캡스톤](https://www.figma.com/design/QulBXJPP2qYhRhh8lGzT66)
- 개발 가이드: [docs/개발-가이드.md](docs/개발-가이드.md)

## 스택

| 영역          | 선택                                   | 버전                            |
| ------------- | -------------------------------------- | ------------------------------- |
| 런타임        | Node.js                                | 22 이상 (`.nvmrc` = 26)         |
| 패키지 매니저 | pnpm                                   | 11.5 (`packageManager` 로 고정) |
| 빌드          | Vite                                   | 8.3                             |
| UI            | React + TypeScript                     | 19.3 / 6.0                      |
| 스타일        | Tailwind CSS (`@tailwindcss/vite`)     | 4.3                             |
| 라우팅        | react-router-dom                       | 7.18                            |
| 린트          | oxlint                                 | 1.89                            |
| 포맷          | Prettier + prettier-plugin-tailwindcss | 3.9 / 0.8                       |

인증·DB는 백엔드가 담당합니다. 프론트는 `VITE_API_BASE_URL` 로 백엔드 API만 호출하며 외부 SaaS SDK를 직접 들고 있지 않습니다.

## 빠른 시작

```bash
corepack enable          # package.json 의 pnpm 버전을 자동 사용
cp .env.example .env     # VITE_API_BASE_URL 설정
pnpm install
pnpm dev                 # http://localhost:5173
```

npm 이나 yarn 으로 설치하면 `preinstall` 단계에서 차단됩니다.

## 스크립트

| 명령                | 설명                                          |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | 개발 서버 (HMR)                               |
| `pnpm build`        | `tsc -b` 타입 체크 후 프로덕션 빌드 → `dist/` |
| `pnpm preview`      | 빌드 결과 로컬 미리보기                       |
| `pnpm lint`         | oxlint 정적 분석                              |
| `pnpm format`       | Prettier 로 전체 포맷                         |
| `pnpm format:check` | 포맷 검사만 (CI 용)                           |

## 폴더 구조

```
src/
  main.tsx          진입점 (StrictMode + App)
  App.tsx           RouterProvider
  router.tsx        라우트 등록 (명세서 W-01~W-06)
  index.css         Tailwind 진입점 + @theme 디자인 토큰
  pages/            화면 단위 컴포넌트 (라우트 1개 = 파일 1개)
  components/       화면 공용 UI (RootLayout, Navbar, Card 등)
  features/         도메인별 묶음 (API 호출 + 상태 + 전용 컴포넌트)
  lib/              api.ts 등 프레임워크 무관 유틸
  hooks/            공용 React 훅
  types/            공용 타입
  assets/           이미지·폰트
public/             그대로 서빙되는 정적 파일 (favicon 등)
docs/               프로젝트 문서
```

`@/` 는 `src/` 별칭입니다 (`vite.config.ts`, `tsconfig.app.json` 양쪽에 정의).

## 환경 변수

| 변수                | 설명                   | 기본값                  |
| ------------------- | ---------------------- | ----------------------- |
| `VITE_API_BASE_URL` | workation-backend 주소 | `http://localhost:8000` |

`.env` 는 커밋하지 않습니다. 새 변수를 추가할 때는 `.env.example` 과 `src/vite-env.d.ts` 의 `ImportMetaEnv` 를 함께 갱신합니다.

## 디자인

- 디자인 토큰은 Figma 01 Foundations 의 Tokens 컬렉션(Light)과 1:1 로 `src/index.css` 의 `@theme` 블록에 있습니다.
  - 색: 원시 팔레트(`bg-rausch-500`, `bg-gray-800`)와 의미 토큰(`bg-brand-primary`, `text-text-primary`, `border-border-default`, `text-grade-s-fg`, `bg-heat-500`)
  - 라운드: `rounded-lg`(8) · `rounded-xl`(14) · `rounded-2xl`(20) · `rounded-full`
  - 그림자: `shadow-float` 하나만
  - 타이포: `text-heading-xl`, `text-body-sm`, `text-number-rating` 처럼 Figma 텍스트 스타일 이름 그대로. Black Han Sans 는 `font-display` 를 함께 지정
  - 간격: Tailwind 기본 4px 단위가 Figma space/1~16 과 동일
- 서체는 `index.html` 에서 Google Fonts 로 로드합니다(Noto Sans KR 400/500/700, Black Han Sans, Gaegu 400/700).
- 컴포넌트에서 hex 임의값(`text-[#222]`)을 쓰지 않습니다. 값 변경은 Figma → `디자인/디자인-원칙.md` → `src/index.css` 순서로 반영합니다.
