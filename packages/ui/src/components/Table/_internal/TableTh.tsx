import { CSSProperties, ReactNode } from "react"
import { SortDirection } from "../@Types/table"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import IconButton from "../../IconButton/IconButton"
import { styled } from "../../../tokens/customStyled"

export type TableThProps = BaseMixinProps & {
  children: ReactNode
  align?: CSSProperties["textAlign"]
  sort?: SortDirection
  onSortChange?: (direction: SortDirection) => void
  resizable?: boolean
  onResizeStart?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const getNextSortDirection = (current?: SortDirection): SortDirection => {
  if (current === "ASC") return "DESC"
  return "ASC"
}

const TableTh = ({
  children,
  align = "center",
  sort,
  onSortChange,
  resizable,
  onResizeStart,
  ...others
}: TableThProps) => {
  const handleSortClick = () => {
    if (!sort) return
    const next = getNextSortDirection(sort)
    onSortChange?.(next)
  }

  return (
    <Root align={align} {...others}>
      <Flex align="center" justify={align as any} gap={4} sx={{ minWidth: 0 }}>
        {typeof children === "string" ? (
          <Typography ellipsis text={children} sx={{ display: "inline-block", minWidth: 0 }} />
        ) : (
          children
        )}

        {sort && (
          <IconButton
            icon="ArrowDown"
            onClick={handleSortClick}
            disableInteraction={false}
            sx={{
              opacity: sort === "ASC" ? 1 : 0.3,
              transform: sort === "ASC" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
          />
        )}
      </Flex>

      {resizable && <ResizeHandle onMouseDown={onResizeStart} />}
    </Root>
  )
}

const Root = styled.div<BaseMixinProps & { align?: string }>`
  ${BaseMixin};
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
  text-align: ${({ align }) => align || "center"};
  padding: 4px 6px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  min-width: 0;
  &:last-child {
    border-right: none;
  }
`

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;
  &:hover {
    background-color: ${({ theme }) => theme.colors.grayscale[200]};
  }
`

export default TableTh
