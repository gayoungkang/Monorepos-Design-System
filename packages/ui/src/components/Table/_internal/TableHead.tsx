import { HTMLAttributes, ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"
import { theme } from "../../../tokens/theme"

export type TableHeadProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    children: ReactNode
    sticky?: boolean
    top?: string
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableHead
 *
 * * Grid 기반 테이블에서 헤더 영역을 감싸는 컨테이너 컴포넌트
 * * table 태그의 thead 역할을 div 기반 레이아웃으로 대체한 구조
 *
 * * sticky 헤더 지원
 *   * sticky=true 인 경우 position: sticky 로 동작
 *   * top 값을 통해 상단 고정 위치(offset)를 지정 가능
 *   * left/right를 0으로 고정하여 가로 스크롤 시 헤더 정렬 유지
 *   * z-index는 theme.zIndex.sticky 값을 사용하여 본문보다 위에 렌더링
 *
 * * BaseMixinProps 지원
 *   * padding, margin, backgroundColor, sx 등 공통 스타일 확장 가능
 *   * 테이블 외부 레이아웃(Grid/Flex)과의 합성 사용을 전제로 설계
 *
 * * 스타일 특징
 *   * 배경색은 흰색(grayscale.white)으로 고정
 *   * sticky 사용 여부에 따라 position을 static/sticky로 분기
 *
 * @module TableHead
 * Grid 기반 테이블 헤더 컨테이너를 제공합니다.
 * - sticky 옵션을 통해 스크롤 시 상단 고정 헤더를 구현할 수 있습니다.
 *
 * @usage
 * <TableHead sticky top="0px">
 *   <TableTr columns={gridColumns}>...</TableTr>
 * </TableHead>
 *
 * <TableHead>
 *   <TableTr columns={gridColumns}>...</TableTr>
 * </TableHead>
 *
/---------------------------------------------------------------------------**/

const TableHead = ({ children, sticky, top = "0px", ...baseProps }: TableHeadProps) => {
  return (
    <Root {...baseProps} $sticky={sticky} $top={top}>
      {children}
    </Root>
  )
}

const Root = styled.div<BaseMixinProps & { $sticky?: boolean; $top: string }>`
  ${BaseMixin};

  position: ${({ $sticky }) => ($sticky ? "sticky" : "static")};
  top: ${({ $top }) => $top ?? "0px"};
  left: 0;
  right: 0;
  z-index: ${theme.zIndex?.sticky ?? 700};
  background-color: ${({ theme }) => theme.colors.grayscale.white};
`

export default TableHead
