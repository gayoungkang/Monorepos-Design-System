// Table/_internal/TableTr.tsx
import { ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"

export type TableTrProps<T> = BaseMixinProps & {
  children: ReactNode
  columns: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onDoubleClick?: (row: T | null) => void
  selected?: boolean
  disabled?: boolean
  rowData?: T | null

  // ✅ summaryRow 하단 고정용
  stickyBottom?: boolean
  stickyBottomOffset?: number
}

const TableTr = <T,>({
  onClick,
  onDoubleClick,
  children,
  selected,
  disabled,
  rowData = null,
  columns,
  stickyBottom,
  stickyBottomOffset,
  ...others
}: TableTrProps<T>) => {
  const handleDoubleClick = () => {
    if (disabled) return
    onDoubleClick?.(rowData)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
  }

  return (
    <Root
      {...others}
      $columns={columns}
      $selected={selected}
      $disabled={disabled}
      $stickyBottom={stickyBottom}
      $stickyBottomOffset={stickyBottomOffset ?? 0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </Root>
  )
}

const Root = styled.div<
  BaseMixinProps & {
    $columns: string
    $selected?: boolean
    $disabled?: boolean
    $stickyBottom?: boolean
    $stickyBottomOffset: number
  }
>`
  ${BaseMixin};

  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.grayscale.white};
  ${({ $stickyBottom, $stickyBottomOffset, theme }) =>
    $stickyBottom
      ? `
        position: sticky;
        bottom: ${$stickyBottomOffset}px;
        z-index: 3;
        box-shadow: 0 -1px 0 ${theme.colors.border.default};
      `
      : ""}
`

export default TableTr
