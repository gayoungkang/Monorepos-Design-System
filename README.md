# ACME Design System Monorepo (Atomic Design + Monorepos + Design System)

(Yarn + Vite + React + TypeScript + styled-components + Storybook + tsup)

전세계 대규모 기술 기업들이 규모 확장성과 디자인 일관성으로 사용하는 방법론에 따라 설계

## 아키텍쳐

```bash
my-org/
├─ package.json
├─ tsconfig.json
├─ yarn.lock
├─ apps/
│ └─ web/       # Vite 앱 (소비자)
└─ packages/
    └─ ui/      # 디자인 시스템 패키지 (Atomic Design)
        ├─ src/
        │ ├─ atoms/                    # 원자 : 가장 작은 구성 컴포넌트 (버튼, 제목, 텍스트 입력 필드)
        │ │   └─ Button/
        │ │   ├─ Button.tsx
        │ │   ├─ Button.stories.ts
        │ │   ├─ Button.styles.ts
        │ │   └─ index.ts
        │ ├─ molecules/                # 분자 : 2개 이상의 원자로 구성
        │ ├─ organisms/                # 분자들의 모음
        │ ├─ templates/                # 유기체들을 모아 템플릿으로 생성
        │ ├─ tokens/
        │ │   ├─ colors.ts
        │ │   └─ theme.ts
        │ └─ index.ts
        ├─ package.json
        ├─ tsconfig.json
        └─ tsup.config.ts
```

## 설치

```bash
cd acme-design-system-storybook

# 모든 의존성 설치
yarn

# (선택) UI 패키지만 빌드
yarn build:ui
```

## 개발 서버

### 웹 앱 (Vite)

```bash
yarn dev
```

브라우저: http://localhost:5173

### Storybook (UI 컴포넌트)

```bash
yarn storybook
```

브라우저: http://localhost:6006

## UI 패키지 빌드

```bash
yarn build:ui
```

`packages/ui/dist` 에 CJS, ESM, 타입 선언이 생성됩니다.
