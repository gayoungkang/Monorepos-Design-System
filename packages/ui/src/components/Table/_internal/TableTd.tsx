import { HTMLAttributes, ReactNode, forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"
import { theme } from "../../../tokens/theme"
import { normalizeAlign } from "../@utils/table"
import { TableCellAlign } from "../@Types/table"

export type TableTdProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    children?: ReactNode
    align?: TableCellAlign
    colSpan?: number
    disabled?: boolean
    stickyBottom?: boolean

    stickyBottomOffset?: number | string

    clickable?: boolean
    selected?: boolean
  }

const TableTd = forwardRef<HTMLDivElement, TableTdProps>(
  (
    {
      children,
      align,
      colSpan,
      disabled,
      stickyBottom,
      stickyBottomOffset,
      clickable,
      selected,
      ...baseProps
    },
    ref,
  ) => {
    const safeAlign = normalizeAlign(align)

    const bottom =
      stickyBottom && stickyBottomOffset !== undefined
        ? typeof stickyBottomOffset === "number"
          ? `${stickyBottomOffset}px`
          : stickyBottomOffset
        : "0px"

    return (
      <Root
        ref={ref}
        {...baseProps}
        $align={safeAlign}
        $disabled={disabled}
        $stickyBottom={stickyBottom}
        $stickyBottomOffset={bottom}
        $clickable={clickable}
        $selected={selected}
        style={{
          ...(baseProps.style ?? {}),
          ...(colSpan && colSpan > 1 ? { gridColumn: `span ${colSpan}` } : {}),
        }}
      >
        {children}
      </Root>
    )
  },
)

TableTd.displayName = "TableTd"

const Root = styled.div<
  BaseMixinProps & {
    $align?: TableCellAlign
    $disabled?: boolean
    $stickyBottom?: boolean
    $stickyBottomOffset?: string
    $clickable?: boolean
    $selected?: boolean
  }
>`
  ${BaseMixin};
  display: inline-flex;
  padding: 10px 12px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ $disabled }) => ($disabled ? theme.colors.text.disabled : theme.colors.text.primary)};
  justify-content: ${({ $align }) => $align ?? "left"};
  word-wrap: break-word;
  white-space: pre-wrap;
  min-width: 0;
  background-color: ${theme.colors.grayscale.white};

  ${({ $clickable, $disabled }) =>
    $clickable && !$disabled
      ? `
        cursor: pointer;
      `
      : ""}

  ${({ $stickyBottom, $stickyBottomOffset }) =>
    $stickyBottom
      ? `
        position: sticky;
        bottom: ${$stickyBottomOffset ?? "0px"};
        z-index: ${theme.zIndex?.sticky};
      `
      : ""}

  &:last-child {
    border-right: none;
  }
`

export default TableTd
