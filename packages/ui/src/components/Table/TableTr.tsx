import { ReactNode } from "react"

import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type TableTrProps<T> = BaseMixinProps & {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void
  onDoubleClick?: (row: T | null) => void
  selected?: boolean
  disabled?: boolean
  rowData?: T | null
}

const TableTr = <T,>({
  onClick,
  onDoubleClick,
  children,
  selected,
  disabled,
  rowData = null,
  ...others
}: TableTrProps<T>) => {
  const handleDoubleClick = () => {
    if (disabled) return
    onDoubleClick?.(rowData)
  }

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (disabled) return
    onClick?.(e)
  }

  return (
    <StyledTableTr
      selected={selected}
      disabled={disabled}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...others}
    >
      {children}
    </StyledTableTr>
  )
}

const StyledTableTr = styled.tr<{
  selected?: boolean
  disabled?: boolean
}>`
  display: table-row;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};

  &:hover {
    cursor: ${({ disabled, selected }) =>
      disabled ? "not-allowed" : selected ? "pointer" : "default"};
    background-color: ${({ disabled, selected, theme }) =>
      disabled ? "transparent" : selected ? theme.colors.primary[50] : "transparent"};
  }
`

export default TableTr
