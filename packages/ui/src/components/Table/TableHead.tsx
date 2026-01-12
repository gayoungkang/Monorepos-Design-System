import { ReactNode } from "react"
import { styled } from "../../tokens/customStyled"
import { BaseMixinProps, toCssValue } from "../../tokens/baseMixin"
import { TABLE_HEADER_ZINDEX } from "../../types/zindex"

export type TableHeadProps = BaseMixinProps & {
  children: ReactNode
  top?: string | number
  sticky?: boolean
}
/**---------------------------------------------------------------------------/

* ! TableHead
*
* * 테이블 헤더(<thead>) 영역을 담당하는 컴포넌트
* * sticky 옵션을 통해 헤더 고정(sticky) 동작 지원
* * top 값을 string | number로 받아 고정 위치 오프셋 제어
* * TABLE_HEADER_ZINDEX 상수를 사용하여 스크롤 시 헤더 레이어 우선순위 보장
* * styled.thead 기반으로 table-header-group display 유지
* * theme 기반 background 색상 적용
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableHead
* 테이블의 헤더 영역을 렌더링하는 컴포넌트입니다.
* - sticky=true일 경우 스크롤 컨테이너 내에서 헤더를 상단에 고정합니다.
* - top 옵션을 통해 고정 헤더의 상단 오프셋을 조절할 수 있습니다.
* - Table, InfiniteTable 등 상위 테이블 컴포넌트에서 공통으로 사용됩니다.
*
* @usage
* <TableHead sticky top={0}>
*   <TableTr>...</TableTr>
* </TableHead>

/---------------------------------------------------------------------------**/

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
