import type { HTMLAttributes, MouseEvent as ReactMouseEvent, ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"

export type TableTrProps<T> = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps | "children" | "onDoubleClick"> & {
    children: ReactNode
    columns: string
    onDoubleClick?: (row: T | null) => void
    selected?: boolean
    disabled?: boolean
    rowData?: T | null
    stickyBottom?: boolean
    stickyBottomOffset?: number
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableTr
 *
 * * Grid 기반 테이블 Row(행) 래퍼 컴포넌트
 * * columns(grid-template-columns) 문자열을 받아 동일한 컬럼 레이아웃으로 셀을 배치
 * * BaseMixinProps를 그대로 전달하여 padding/margin/sx 등 공통 스타일 확장 지원
 *
 * * 이벤트 처리
 *   * disabled=true 이면 onClick / onDoubleClick 모두 차단
 *   * onDoubleClick은 rowData를 인자로 상위로 전달
 *   * onClick은 DOM 이벤트를 그대로 상위로 전달
 *
 * * 선택/비활성 상태 표현
 *   * $selected, $disabled 값을 스타일 props로 전달(확장 여지)
 *
 * * SummaryRow 하단 고정(sticky bottom)
 *   * stickyBottom=true 이면 position: sticky + bottom offset 적용
 *   * stickyBottomOffset(px)로 여러 summary 라인을 누적 고정할 때 겹침 방지
 *   * box-shadow로 상단 경계선(구분선) 시각 효과 제공
 *
 * @module TableTr
 * grid-template-columns 기반으로 셀을 정렬하는 테이블 행 컨테이너입니다.
 * - 기본 행 렌더링 및 summary row 하단 고정(sticky) 용도로 사용합니다.
 *
 * @usage
 * <TableTr columns="120px 1fr 160px" onClick={...} />
 * <TableTr columns={gridColumns} stickyBottom stickyBottomOffset={32} />
 *
/---------------------------------------------------------------------------**/

const TableTr = <T,>({
  onClick,
  onDoubleClick,
  children,
  selected,
  disabled,
  rowData = null,
  columns,
  stickyBottom,
  stickyBottomOffset,
  ...others
}: TableTrProps<T>) => {
  // * disabled 상태에서 더블클릭을 차단하고, 유효한 rowData만 콜백으로 전달
  const handleDoubleClick = () => {
    if (disabled) return
    onDoubleClick?.(rowData)
  }

  // * disabled 상태에서 클릭을 차단하고, 상위 onClick을 그대로 위임
  const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
  }

  return (
    <Root
      {...others}
      $columns={columns}
      $selected={selected}
      $disabled={disabled}
      $stickyBottom={stickyBottom}
      $stickyBottomOffset={stickyBottomOffset ?? 0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </Root>
  )
}

const Root = styled.div<
  BaseMixinProps & {
    $columns: string
    $selected?: boolean
    $disabled?: boolean
    $stickyBottom?: boolean
    $stickyBottomOffset: number
  }
>`
  ${BaseMixin};

  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.grayscale.white};

  ${({ $stickyBottom, $stickyBottomOffset, theme }) =>
    $stickyBottom
      ? `
        position: sticky;
        bottom: ${$stickyBottomOffset}px;
        z-index: 3;
        box-shadow: 0 -1px 0 ${theme.colors.border.default};
      `
      : ""}
`

export default TableTr
