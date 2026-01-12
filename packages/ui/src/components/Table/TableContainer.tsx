import { ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type TableContainerProps = BaseMixinProps & {
  children: ReactNode
}
/**---------------------------------------------------------------------------/

* ! TableContainer
*
* * 테이블 전체를 감싸는 컨테이너 컴포넌트
* * styled.table 기반으로 테이블 레이아웃 및 기본 스타일 정의
* * width 100% 및 table-layout:auto 설정
* * border-collapse / border-spacing 제어로 셀 간 간격 제거
* * theme 기반 borderRadius 및 background 색상 적용
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableContainer
* Table, InfiniteTable 등 상위 테이블 컴포넌트에서
* 공통 테이블 레이아웃과 스타일을 제공하는 컨테이너입니다.
*
* @usage
* <TableContainer>
*   <TableHead />
*   <TableBody />
* </TableContainer>

/---------------------------------------------------------------------------**/

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
