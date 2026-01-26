import { HTMLAttributes, ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"
import { theme } from "../../../tokens/theme"

export type TableHeadProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    children: ReactNode
    sticky?: boolean
    top?: string
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableHead
 *
 * * Grid 기반 테이블에서 헤더 영역을 감싸는 컨테이너 컴포넌트
 *
/---------------------------------------------------------------------------**/

const TableHead = ({ children, sticky, top = "0px", ...baseProps }: TableHeadProps) => {
  return (
    <Root {...baseProps} $sticky={sticky} $top={top}>
      {children}
    </Root>
  )
}

const Root = styled.div<BaseMixinProps & { $sticky?: boolean; $top: string }>`
  ${BaseMixin};

  position: ${({ $sticky }) => ($sticky ? "sticky" : "static")};
  top: ${({ $top }) => $top ?? "0px"};
  left: 0;
  right: 0;
  z-index: ${theme.zIndex?.sticky ?? 700};
  background-color: ${({ theme }) => theme.colors.grayscale.white};
  overflow: hidden;
`

export default TableHead
