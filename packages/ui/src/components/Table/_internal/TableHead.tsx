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

* ! TableHead
*
* * Grid/Div 기반 테이블 구조에서 헤더 영역을 담당하는 컴포넌트
* * sticky 옵션을 통해 헤더 고정(sticky) 동작 지원
* * top 값을 문자열로 받아 고정 헤더의 상단 오프셋 제어
* * theme.zIndex.sticky 값을 사용해 스크롤 시 헤더 레이어 우선순위 보장
* * styled.div 기반으로 테이블 헤더 레이아웃 구성
* * BaseMixin 기반 외부 스타일 확장 지원
*
* @module TableHead
* 테이블 내부 헤더 영역을 렌더링하는 컴포넌트입니다.
* - table 태그가 아닌 div/grid 기반 테이블 구조에서 사용됩니다.
* - sticky=true일 경우 스크롤 컨테이너 기준으로 헤더를 상단에 고정합니다.
* - top 옵션을 통해 고정 헤더의 위치를 세밀하게 조정할 수 있습니다.
*
* @usage
* <TableHead sticky top="0px">
*   ...
* </TableHead>

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
  top: ${({ $top }) => $top ?? 0};
  left: 0;
  right: 0;
  z-index: ${theme.zIndex?.sticky};
  background-color: ${({ theme }) => theme.colors.grayscale.white};
`

export default TableHead
