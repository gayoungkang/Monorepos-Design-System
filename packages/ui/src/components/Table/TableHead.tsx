import { ReactNode } from "react"
import { styled } from "../../tokens/customStyled"
import { BaseMixinProps, toCssValue } from "../../tokens/baseMixin"
import { TABLE_HEADER_ZINDEX } from "../../types/zindex"

export type TableHeadProps = BaseMixinProps & {
  children: ReactNode
  top?: string | number
  sticky?: boolean
}

const TableHead = ({ children, sticky = true, top = 0 }: TableHeadProps) => {
  return (
    <StyledTableHead top={top} sticky={sticky}>
      {children}
    </StyledTableHead>
  )
}

export const StyledTableHead = styled.thead<{
  sticky: boolean
  top?: string | number
}>`
  display: table-header-group;
  position: ${(props) => (props.sticky ? "sticky" : "static")};
  top: ${(props) => (typeof props.top === "string" ? props.top : toCssValue(props.top))};
  z-index: ${TABLE_HEADER_ZINDEX};
  background-color: ${({ theme }) => theme.colors.background.default};
`

export default TableHead
