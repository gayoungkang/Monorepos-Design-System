# Component-first Design System Monorepo

**Yarn + Vite + React + TypeScript + styled-components + Storybook + tsup**

전세계 대규모 기술 기업들이 사용하는  
**확장 가능한 Component-first 디자인 시스템 아키텍처** 기반으로 설계된 Monorepo입니다.

---

# 디자인 시스템 핵심 규칙

- 모든 UI는 **`@acme/ui` 패키지에서만 개발**
- 앱(`apps/web`)에는 UI 컴포넌트 작성 금지
- UI 수정 PR은 **Storybook 스크린샷/링크 필수**
- 모든 페이지는 디자인 시스템 컴포넌트 기반
- `ThemeProvider`는 앱 루트에서만 적용

---

# Component-first 철학

Atomic은 사고 방식, Component-first는 구현 방식입니다.

- UI는 독립 단위로 구성
- 재사용성 / 접근성 / 일관성 보장
- 컴포넌트는 **표현 전용**, 비즈니스 로직 없음

---

# 아키텍처

```
my-org/
├─ apps/
│  └─ web/              # 실제 서비스 앱
└─ packages/
   └─ ui/               # 디자인 시스템
       ├─ src/
       │  ├─ components/
       │  ├─ tokens/
       │  ├─ utils/
       │  └─ index.ts
```

---

# 설치

```bash
yarn
```

---

# 개발 서버

### Web

```bash
yarn dev
```

### Storybook

```bash
yarn storybook
```

---

# UI 패키지 빌드

```bash
yarn build:ui
```

생성물:

- ESM
- CJS
- 타입 선언 (.d.ts)

---

# Storybook CI 빌드

```bash
yarn storybook:build
yarn storybook:test
```

---

# 코드 품질

```bash
yarn lint
yarn format
```

---

# Icon 시스템 (번들러 독립 구조)

Vite/Webpack 등 특정 번들러에 종속되지 않는  
**런타임 SVG Sprite 방식**을 사용합니다.

## 아이콘 원본 위치

```
root/public/icons/svgs/
```

---

## 아이콘 파이프라인 실행

아이콘 수정 시 반드시 실행:

```bash
yarn fix:svg
yarn icons:generate
yarn copy:sprite
```

---

## 파이프라인 구성

| 스크립트                     | 역할                         |
| ---------------------------- | ---------------------------- |
| `fix-svg.ts`                 | SVG 정규화                   |
| `generate-icon-sprite.ts`    | sprite.svg 생성              |
| `generate-icon-types.ts`     | `IconName` 타입 생성         |
| `copy-icon-sprite-to-web.ts` | sprite를 web public으로 복사 |

---

## 사용법

### 앱 루트

```tsx
<IconSpriteProvider />
```

### 컴포넌트

```tsx
<Icon name="CloseLine" />
```

---

# 버전 관리 (Changesets)

```bash
yarn dlx @changesets/cli init
yarn changeset
yarn version-packages
yarn release
```

---

# 이 구조의 장점

- 번들러 독립 UI 패키지
- Tree-shaking 최적화
- 타입 안정성
- Storybook 문서화
- 대기업 수준 아키텍처

---

# 개발 규칙 요약

- UI는 `@acme/ui`에서만 개발
- 앱에서 스타일 직접 작성 금지
- Token 기반 스타일만 허용
- Storybook 없는 UI PR 금지
- 비즈니스 로직은 앱 레이어에서만 작성

---

이 구조는 Shopify Polaris, Atlassian, Adobe Spectrum, Airbnb, Microsoft Fluent UI와 동일한 아키텍처 개념을 따릅니다.
