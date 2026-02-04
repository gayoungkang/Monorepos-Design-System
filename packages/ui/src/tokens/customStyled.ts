import styled from "styled-components"

const STYLE_PROPS = new Set<string>([
  "placement",
  "maxWidth",
  "variant",
  "italic",
  "ellipsis",
  "align",
  "color",
  "size",
  "startIcon",
  "colorVariant",
  "isActive",
  "error",
  "multiline",
  "resizableMultiline",
  "borderRadius",
  "selected",
  "clickable",
  "disableInteraction",
  "showArrow",
  "flexItem",
  "labelPlacement",
  "multipleMonth",
  "leftDisabled",
  "rightDisabled",
  "loading",
  "bgColor",
  "maxHeight",
  "minHeight",
  "minWidth",
  "sticky",
  "boxShadow",
  "closeBehavior",
  "collapsedSize",
])

/**
 * @module styled
 * styled-components의 기본 `styled`를 래핑하여
 * 스타일 전용 커스텀 props가 DOM 요소에 전달되지 않도록 안전하게 필터링합니다.
 *
 * - `shouldForwardProp` 설정으로 스타일 전용 props를 HTML에 전달하지 않음
 * - Proxy로 `styled.div`, `styled.button`, `styled(MyComponent)` 모두 자동 적용
 * - `$`로 시작하는 props는 무조건 스타일용으로 간주하고 DOM으로 전달하지 않음
 *
 * @사용법
 * ```tsx
 * import { styled } from "./customStyled";
 *
 * const Box = styled.div<{ $active: boolean; variant: "primary" | "secondary" }>`
 *   background: ${({ $active }) => ($active ? "red" : "gray")};
 * `;
 * ```
 */

// * DOM으로 보내지 말아야 하는 prop을 정의
const isStyleProp = (prop: string) => {
  if (prop.startsWith("$")) return true

  if (STYLE_PROPS.has(prop)) return true

  return false
}

export const shouldForwardProp = (prop: string) => {
  if (prop.startsWith("$")) return false
  return true
}

// * Proxy로 감싼 커스텀 styled
const customStyled = new Proxy(styled, {
  get(target, prop, receiver) {
    const original = Reflect.get(target, prop, receiver)

    if (typeof original === "function") {
      return original.withConfig({
        shouldForwardProp,
      })
    }

    return original
  },

  apply(target, thisArg, argArray) {
    const styledFn = Reflect.apply(target, thisArg, argArray)

    if (typeof styledFn === "function") {
      return styledFn.withConfig({
        shouldForwardProp,
      })
    }

    return styledFn
  },
})

export { customStyled as styled }
