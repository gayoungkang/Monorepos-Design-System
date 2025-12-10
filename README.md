# Component-first Design System Monorepo (Component-first + Monorepos + Design System)

(Yarn + Vite + React + TypeScript + styled-components + Storybook + tsup)
전세계 대규모 기술 기업들이 규모 확장성과 디자인 일관성을 위해 사용하는 실무 구조를 기반으로 설계

---

## 디자인 시스템 핵심 규칙

- 모든 UI는 @acme/ui에서 관리
- 서비스(app) 폴더에는 UI를 구현하지 않음
- UI 수정 PR은 Storybook 참고 스크린샷/링크 포함
- 모든 페이지는 디자인 시스템 기반으로 구성
- ThemeProvider는 앱 루트 레벨에서 적용

## Component-first 철학

- Atomic은 “분류 철학”, Component-first는 “구현 방식”
- UI는 독립적인 단위로 구성
- 재사용성 + 접근성 + 디자인 일관성 보장
- 컴포넌트는 UI 상태/로직 없이 순수 표현에 집중

---

## 핵심

Atomic 구조는 “사고 방식”으로만 사용하고,
폴더/컴포넌트 구조는 **Component-first** 방식으로 유지합니다.

## 구성 원칙

- 1 컴포넌트 = 1 폴더
- Component-first (Atomic 구분 폴더 없음)
- 비즈니스 로직은 포함하지 않음
- 디자인 토큰은 tokens 에서만 관리
- Storybook으로 문서화

### Component-first + Atomic Thinking

- Atoms (UI Primitive) : 가장 작은 UI 요소 (조합의 기본 단위)
  ex) Button, Icon, Typography, Input, Checkbox, Flex, Box, Tooltip, Overlay, Label

- Molecules (UI Function Unit) : Atoms 2~3개 이상을 조합해 기능적 UI를 형성
  ex) Input + Label → LabeledInput, Button + Icon → IconButton, Avatar + Label → UserChip, ToggleButtonGroup, Tabs, Tag

- Organisms (UI Composite Pattern) : Molecules를 조합해 UI 구조/UX 패턴 제공
  ex) SearchBar (Input + IconButton + Tag 등), ProductCard, Sidebar, Header, Navbar, DataGrid, Chart + Filter

- Templates (Layout Structure) : 데이터 없이 UI 구조만 제공하는 페이지 템플릿
  ex) Page layout, Dashboard layout, Content + Sidebar, Header + Body + Footer

- Pages (Application Logic) : 비즈니스 로직은 여기에서만 존재
  ex) fetch, 상태관리, router, 비즈니스 로직, 인증

---

## 아키텍쳐

```bash
my-org/
├─ package.json
├─ tsconfig.json
├─ yarn.lock
├─ apps/
│ └─ web/              # 소비자(실제 앱) - Domain/Feature 기반
└─ packages/
    └─ ui/             # 디자인 시스템 (Component-first)
        ├─ src/
        │ ├─ components/               # 모든 UI 컴포넌트는 이름 기준 1폴더
        │ │   └─ Button/
        │ │       ├─ Button.tsx
        │ │       ├─ Button.types.ts
        │ │       ├─ Button.styled.ts
        │ │       ├─ Button.stories.tsx
        │ │       └─ index.ts
        │ ├─ tokens/                   # theme, mixin, design token
        │ │   ├─ theme.ts
        │ │   ├─ baseMixin.ts
        │ │   └─ customStyled.ts
        │ ├─ utils/
        │ └─ index.ts                  # 전체 export
        ├─ package.json
        ├─ tsconfig.json
        └─ tsup.config.ts
```

---

## 설치

```dash

cd acme-design-system-storybook

# 모든 의존성 설치
yarn

# UI 패키지만 빌드
yarn build:ui

```

---

## 개발 서버

### Web (Vite)

브라우저: http://localhost:5173

```dash

yarn dev

```

### Storybook (UI 컴포넌트)

브라우저: http://localhost:6006

```dash

yarn storybook


```

---

## UI 패키지 빌드

packages/ui/dist 에 CJS, ESM, 타입 선언이 생성됩니다.

```dash

yarn build:ui

```
