import { CSSProperties, ReactNode, forwardRef } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { Typography } from "../Typography/Typography"

export type TableTdProps = BaseMixinProps & {
  children?: ReactNode
  clickable?: boolean
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void
  align?: CSSProperties["textAlign"]
  colSpan?: number
  selected?: boolean
  disabled?: boolean
}

const TableTd = forwardRef<HTMLTableCellElement, TableTdProps>(
  ({ children, clickable, onClick, align, colSpan, selected, disabled, ...others }, ref) => {
    console.log("??", disabled)
    return (
      <StyledTableCell
        ref={ref}
        clickable={clickable}
        align={align}
        onClick={onClick}
        colSpan={colSpan}
        selected={selected}
        disabled={disabled}
        {...others}
      >
        {typeof children === "string" ? (
          <Typography text={children} sx={{ display: "inline-block" }} />
        ) : (
          children
        )}
      </StyledTableCell>
    )
  },
)

const StyledTableCell = styled.td<{
  clickable?: boolean
  selected?: boolean
  align?: CSSProperties["textAlign"]
  disabled?: boolean
}>`
  height: 30px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: 0px 8px;
  text-align: ${({ align }) => align ?? "center"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.2s ease-in-out;

  ${({ clickable }) =>
    clickable &&
    `
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  `}

  ${({ disabled, theme }) =>
    disabled &&
    `
    cursor: not-allowed;
    text-decoration: line-through;
    color: ${theme.colors.text.disabled}; 
  `}

  ${({ selected, theme }) =>
    selected &&
    `
    cursor: pointer;
    background-color: ${theme.colors.primary[100]};
    border: 1px solid ${theme.colors.border.default};
    border-right: 1px solid ${theme.colors.grayscale[500]};
    &:first-child {
      border-left: 1px solid ${theme.colors.border.default};
    }
    &:last-child {
      border-right: 1px solid ${theme.colors.border.default};
    }
  `}
`

TableTd.displayName = "TableTd"

export default TableTd
