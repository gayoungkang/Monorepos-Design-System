import type { CSSProperties, HTMLAttributes, JSX, ReactNode } from "react"
import { forwardRef } from "react"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type FlexProps = HTMLAttributes<HTMLDivElement> &
  BaseMixinProps & {
    as?: keyof JSX.IntrinsicElements
    children?: ReactNode
    direction?: CSSProperties["flexDirection"]
    justify?: CSSProperties["justifyContent"]
    align?: CSSProperties["alignItems"]
    wrap?: CSSProperties["flexWrap"]
    gap?: string | number
    extraProps?: Record<string, any>
  }
/**---------------------------------------------------------------------------/
 *
 * ! Flex
 *
 * * 레이아웃 합성에 사용되는 공통 flex 래퍼 컴포넌트
 * * `BaseMixinProps`를 통해 spacing/size/sx 등 공통 스타일 props를 지원하고, DOM div attributes를 함께 수용
 * * flex-direction/justify/align/wrap/gap을 props로 간단히 제어하며, 필요 시 `as`로 태그를 교체 가능
 *
 * * 동작 규칙
 *   * 렌더링은 단일 `StyledFlex`로 위임하며, 전달받은 props를 스타일용 `$*` 프롭으로 매핑
 *   * `extraProps`가 있으면 `StyledFlex`에 먼저 스프레드하여, 호출부에서 임의 속성(예: data-*, aria-*) 확장 가능
 *   * `ref`는 최종 DOM 요소로 전달(forwardRef)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 기본 레이아웃: `display: flex` + `height: max-content`
 *   * direction 기본값: "row"
 *   * justify 기본값: "flex-start"
 *   * align 기본값: "stretch"
 *   * wrap 기본값: "nowrap"
 *   * gap 기본값: "0px"
 *     * number 입력 시 `${n}px`로 변환
 *     * string 입력 시 그대로 적용
 *   * BaseMixin: StyledFlex 마지막에 적용되어 공통 스타일(p/m/width/height/bg/sx 등)이 최종 병합됨
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `as`는 IntrinsicElements 키로 제한되며, 실제 렌더 태그를 변경
 *     * `children`은 flex 컨테이너 내부 콘텐츠로 렌더링
 *     * `extraProps`는 타입상 제한이 적은 확장 포인트로, 호출부가 필요한 속성을 주입하는 용도
 *   * 내부 계산 로직
 *     * gap만 number/string 분기하여 px 문자열로 정규화
 *
 * @module Flex
 * 디자인 시스템의 레이아웃 합성을 위한 기본 flex 컨테이너 컴포넌트
 *
 * @usage
 * <Flex align="center" justify="space-between" gap={8}>
 *   ...
 * </Flex>
 *
/---------------------------------------------------------------------------**/

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    { as = "div", children, direction, justify, align, wrap, gap = "0px", extraProps, ...props },
    ref,
  ) => {
    return (
      <StyledFlex
        ref={ref}
        as={as}
        $direction={direction}
        $justify={justify}
        $align={align}
        $gap={gap}
        $wrap={wrap}
        {...extraProps}
        {...props}
      >
        {children}
      </StyledFlex>
    )
  },
)

Flex.displayName = "Flex"

const StyledFlex = styled.div<
  BaseMixinProps & {
    $direction?: CSSProperties["flexDirection"]
    $justify?: CSSProperties["justifyContent"]
    $align?: CSSProperties["alignItems"]
    $wrap?: CSSProperties["flexWrap"]
    $gap?: string | number
  }
>`
  display: flex;
  height: max-content;
  flex-direction: ${({ $direction }) => $direction ?? "row"};
  justify-content: ${({ $justify }) => $justify ?? "flex-start"};
  align-items: ${({ $align }) => $align ?? "stretch"};
  flex-wrap: ${({ $wrap }) => $wrap ?? "nowrap"};
  gap: ${({ $gap }) => (typeof $gap === "number" ? `${$gap}px` : $gap)};
  ${BaseMixin};
`

export default Flex
