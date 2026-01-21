import type { HTMLAttributes } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"

export type TableContainerProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    children?: React.ReactNode
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableContainer
 *
 * * Grid 기반 Table 레이아웃을 감싸는 최상위 컨테이너 컴포넌트
 * * BaseMixinProps를 그대로 전달받아 외부 레이아웃/스타일 확장 지원
 * * HTMLAttributes<HTMLDivElement>를 병합하여 div 기반 래퍼로 동작
 *
 * * 역할
 *   * 테이블(Grid/TableRow/TableTd 등)을 감싸는 공통 래퍼
 *   * width: 100% 기본 적용
 *   * padding, margin, background, sx 등 BaseMixin 스타일 주입 지점
 *
 * * 스타일 구조
 *   * Root: styled.div
 *     - BaseMixin 적용
 *     - width: 100%
 *
 * @module TableContainer
 * 테이블 전체 레이아웃을 감싸는 컨테이너로,
 * BaseMixin 기반 스타일 확장을 위한 최상위 래퍼 역할을 수행합니다.
 *
 * @usage
 * <TableContainer p={10} bgColor="white">
 *   <TableHead />
 *   <TableBody />
 * </TableContainer>
 *
/---------------------------------------------------------------------------**/

const TableContainer = ({ children, ...baseProps }: TableContainerProps) => {
  return <Root {...baseProps}>{children}</Root>
}

const Root = styled.div<BaseMixinProps>`
  ${BaseMixin};
  width: 100%;
`

export default TableContainer
