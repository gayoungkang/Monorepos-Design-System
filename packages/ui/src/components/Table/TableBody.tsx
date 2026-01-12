import { ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type TableBodyProps = BaseMixinProps & {
  children: ReactNode
}
/**---------------------------------------------------------------------------/

* ! TableBody
*
* * 테이블의 본문 영역(<tbody>)을 담당하는 컴포넌트
* * children으로 전달된 TableRow / TableTr 요소들을 그대로 렌더링
* * styled.tbody 기반으로 table-row-group display 유지
* * theme 기반 background 색상 적용
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableBody
* 테이블 본문 영역을 감싸는 래퍼 컴포넌트입니다.
* - 테이블 레이아웃 규칙을 유지하면서 body 영역 스타일을 일관되게 적용합니다.
* - Table, InfiniteTable 등 상위 테이블 컴포넌트에서 공통으로 사용됩니다.
*
* @usage
* <TableBody>
*   <TableTr>...</TableTr>
* </TableBody>

/---------------------------------------------------------------------------**/

const TableBody = ({ children, ...others }: TableBodyProps) => {
  return <StyledTableBody {...others}>{children}</StyledTableBody>
}

export const StyledTableBody = styled.tbody`
  display: table-row-group;
  background-color: ${(props) => props.theme.colors.background.default};
`

export default TableBody
