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

// * 현재 정렬값을 기준으로 다음 정렬 방향을 토글
const getNextSortDirection = (current?: SortDirection): SortDirection => {
  if (current === "ASC") return "DESC"
  return "ASC"
}
/**---------------------------------------------------------------------------/

* ! TableTh
*
* * 테이블 헤더 셀(<th>)을 담당하는 컴포넌트
* * 컬럼 타이틀(children) 렌더링 및 정렬(sort) UI 제공
* * sort 값(ASC/DESC)에 따라 정렬 아이콘 회전 및 투명도 처리
* * 아이콘 클릭 시 다음 정렬 방향(getNextSortDirection) 계산 후 onSortChange 호출
* * align(textAlign) 옵션으로 헤더 정렬 제어
* * 문자열 children은 Typography로 자동 래핑 및 ellipsis 처리
* * Flex 레이아웃을 사용해 타이틀과 정렬 아이콘 정렬
*
* @module TableTh
* 테이블 컬럼 헤더를 렌더링하며, 정렬 가능한 컬럼의 경우
* 정렬 방향 토글 UI와 콜백을 제공합니다.
* - sort가 존재할 때만 정렬 아이콘을 렌더링합니다.
* - 기본 정렬 토글 순서는 ASC → DESC 입니다.
*
* @usage
* <TableTh sort="ASC" onSortChange={...}>Name</TableTh>
* <TableTh align="right">Price</TableTh>

/---------------------------------------------------------------------------**/

const TableTh = ({ children, align = "center", sort, onSortChange, ...others }: TableThProps) => {
  // * sort가 활성화된 경우에만 정렬 토글을 실행
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
