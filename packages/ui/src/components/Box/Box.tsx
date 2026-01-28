import type { HTMLAttributes, JSX, ReactNode } from "react"
import { forwardRef } from "react"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type BoxProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    children?: ReactNode
    as?: keyof JSX.IntrinsicElements
  }
/**---------------------------------------------------------------------------/
 *
 * ! Box
 *
 * * 레이아웃/래퍼 용도로 사용하는 베이스 Box 컴포넌트입니다.
 * * `BaseMixinProps`(p/m/width/height/backgroundColor/sx 등)를 그대로 지원하며, BaseMixin으로 스타일을 적용합니다.
 * * `as` prop으로 렌더링 태그를 변경할 수 있습니다(default: "div").
 * * forwardRef로 루트 DOM 엘리먼트(ref)를 외부에 노출합니다.
 * * HTMLAttributes<HTMLDivElement>를 확장해 기본 DOM 이벤트/속성 전달을 지원합니다(BaseMixinProps와 충돌 키는 제외).
 *
 * * 주요 로직
 *   * Box():
 *     * props에서 as/children을 분리하고, 나머지 props를 StyledBox에 그대로 전달합니다.
 *     * ref를 StyledBox에 연결하여 외부에서 DOM 접근이 가능합니다.
 *   * StyledBox:
 *     * styled.div 기반이며 BaseMixin을 적용해 공통 스타일/토큰을 일관되게 사용합니다.
 *
 * @module Box
 * BaseMixin 기반의 범용 레이아웃 박스 컴포넌트입니다.
 *
 * @usage
 * <Box p={12} backgroundColor="transparent">
 *   <Box as="section" mt={8}>
 *     Content
 *   </Box>
 * </Box>
 *
/---------------------------------------------------------------------------**/
const Box = forwardRef<HTMLDivElement, BoxProps>(({ as = "div", children, ...props }, ref) => {
  return (
    <StyledBox ref={ref} as={as} {...props}>
      {children}
    </StyledBox>
  )
})

const StyledBox = styled.div<BoxProps>`
  ${BaseMixin};
`

Box.displayName = "Box"
export default Box
