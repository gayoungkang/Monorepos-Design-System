import { ReactNode } from "react"
import styled from "styled-components"
import { BaseMixinProps } from "../../tokens/baseMixin"

export type TableBodyProps = BaseMixinProps & {
  children: ReactNode
}

const TableBody = ({ children, ...others }: TableBodyProps) => {
  return <StyledTableBody {...others}>{children}</StyledTableBody>
}

export const StyledTableBody = styled.tbody`
  display: table-row-group;
  background-color: ${(props) => props.theme.colors.background.default};
`

export default TableBody
