import { ReactNode } from "react"
import { BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"

export type TableContainerProps = BaseMixinProps & {
  children: ReactNode
}
/**---------------------------------------------------------------------------/

* ! TableContainer
*
* * 테이블 외곽 레이아웃을 감싸는 컨테이너 컴포넌트
* * styled.div 기반으로 테이블 영역의 경계 및 배경 스타일 정의
* * width 100% 고정 및 position: relative 설정
* * border / borderRadius를 적용해 테이블 외곽 시각적 구분 제공
* * overflow: hidden으로 내부 콘텐츠 넘침 제어
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableContainer
* 테이블 컴포넌트의 최상위 래퍼로 사용되며,
* 테이블 영역의 테두리, 배경, 레이아웃 기준을 제공합니다.
*
* @usage
* <TableContainer>
*   <Table />
* </TableContainer>

/---------------------------------------------------------------------------**/

const TableContainer = ({ children, ...others }: TableContainerProps) => {
  return <Root {...others}>{children}</Root>
}

export const Root = styled.div<Omit<TableContainerProps, "children">>`
  position: relative;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
`

export default TableContainer
