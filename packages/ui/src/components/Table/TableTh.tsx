import { CSSProperties, ReactNode } from "react"
import { SortDirection } from "./@Types/table"
import { BaseMixinProps } from "../../tokens/baseMixin"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"
import { styled } from "../../tokens/customStyled"

export type TableThProps = BaseMixinProps & {
  children: ReactNode
  align?: CSSProperties["textAlign"]
  sort?: SortDirection
  onSortChange?: (direction: SortDirection) => void
}

const getNextSortDirection = (current?: SortDirection): SortDirection => {
  if (current === "ASC") return "DESC"
  return "ASC"
}

const TableTh = ({ children, align = "center", sort, onSortChange, ...others }: TableThProps) => {
  const handleSortClick = () => {
    if (!sort) return
    const next = getNextSortDirection(sort)
    onSortChange?.(next)
  }

  return (
    <StyledTableTh align={align} {...others}>
      <Flex align="center" justify={align} gap={4}>
        {typeof children === "string" ? (
          <Typography ellipsis text={children} sx={{ display: "inline-block" }} />
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
    </StyledTableTh>
  )
}

const StyledTableTh = styled.th<{ align?: string }>`
  height: 24px;
  text-align: ${({ align }) => align || "center"};
  padding: 4px 6px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.background.default};

  &:last-child {
    border-right: none;
  }
`

export default TableTh
