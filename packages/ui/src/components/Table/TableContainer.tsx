import { ReactNode } from "react"
import styled from "styled-components"
import { BaseMixinProps } from "../../tokens/baseMixin"

export type TableContainerProps = BaseMixinProps & {
  children: ReactNode
}

const TableContainer = ({ children, ...others }: TableContainerProps) => {
  return <StyledTable {...others}>{children}</StyledTable>
}

export const StyledTable = styled.table<Omit<TableContainerProps, "children">>`
  position: relative;
  table-layout: auto;
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  border-top-left-radius: ${({ theme }) => theme.borderRadius[4]};
  border-top-right-radius: ${({ theme }) => theme.borderRadius[4]};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius[4]};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius[4]};
  background-color: ${(props) => props.theme.colors.background.default};
`

export default TableContainer
