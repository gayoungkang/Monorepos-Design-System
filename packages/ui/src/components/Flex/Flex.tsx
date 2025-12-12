import { forwardRef, HTMLAttributes, JSX, ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type FlexProps = HTMLAttributes<HTMLElement> &
  BaseMixinProps & {
    as?: keyof JSX.IntrinsicElements
    children?: ReactNode
    direction?: React.CSSProperties["flexDirection"]
    justify?: React.CSSProperties["justifyContent"]
    align?: React.CSSProperties["alignItems"]
    wrap?: React.CSSProperties["flexWrap"]
    gap?: string
    extraProps?: Record<string, any>
  }

/**
 * @module Flex
 * display: flex 속성을 가지며, 기본적인 flex 레이아웃 설정을 지원하는 컴포넌트입니다.
 * - Box 컴포넌트의 padding, margin, sx 등 모든 스타일 유틸리티(BaseMixin)를 지원합니다.
 * - flex 방향(direction), 주 축 정렬(justify), 교차 축 정렬(align), 요소 간격(gap) 등을 설정할 수 있습니다.
 *
 * @props
 * - as: HTML 요소 태그명 (기본값: "div")
 * - children: 내부에 렌더링할 React 노드
 * - direction: flex 방향 ("row" | "column" | "row-reverse" | "column-reverse")
 * - justify: 주 축 정렬 (CSS justify-content 값)
 * - align: 교차 축 정렬 (CSS align-items 값)
 * - wrap: flex-wrap 설정 ("nowrap" | "wrap" | "wrap-reverse")
 * - gap: flex 아이템 간격 (CSS gap 값)
 * - ...BaseMixin 스타일링 props 포함
 *
 * @상세설명
 * - Flex 컴포넌트는 flexbox 레이아웃을 간편하게 구현하기 위한 래퍼입니다.
 * - 기본적으로 display: flex와 height: max-content가 적용됩니다.
 * - direction, justify, align, wrap, gap 속성으로 다양한 flex 레이아웃 구성이 가능합니다.
 * - BaseMixin을 통해 margin, padding 등 추가 스타일링을 쉽게 조절할 수 있습니다.
 * - forwardRef를 사용하여 부모 컴포넌트에서 DOM에 직접 접근할 수 있습니다.
 *
 * @사용법
 * ```tsx
 * <Flex direction="column" justify="center" align="center" gap="12px" p="16px">
 *   <Item1 />
 *   <Item2 />
 * </Flex>
 * ```
 */

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ as = "div", children, direction, justify, align, wrap, gap, extraProps, ...props }, ref) => {
    return (
      <StyledFlex
        ref={ref}
        as={as}
        direction={direction}
        justify={justify}
        align={align}
        gap={gap}
        wrap={wrap}
        {...props}
        {...extraProps}
      >
        {children}
      </StyledFlex>
    )
  },
)

Flex.displayName = "Flex"

const StyledFlex = styled.div<
  BaseMixinProps & {
    direction?: string
    justify?: string
    align?: string
    wrap?: string
    gap?: string
  }
>`
  display: flex;
  height: max-content;
  flex-direction: ${({ direction }) => direction ?? "row"};
  justify-content: ${({ justify }) => justify ?? "flex-start"};
  align-items: ${({ align }) => align ?? "stretch"};
  flex-wrap: ${({ wrap }) => wrap ?? "nowrap"};
  gap: ${({ gap }) => gap ?? "0px"};
  ${BaseMixin};
`

export default Flex
