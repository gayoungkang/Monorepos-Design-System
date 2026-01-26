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
    rowHeight?: number
    stickyBottom?: boolean
    stickyBottomOffset?: number
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableTr
 *
 * * Grid 기반 Table에서 “행(Row)” 컨테이너를 렌더링하는 컴포넌트
 * * `columns`(grid-template-columns) 문자열을 기반으로 셀 레이아웃을 고정하고 children을 그리드로 배치
 * * 클릭/더블클릭 이벤트는 disabled 상태를 우선 차단하며, 더블클릭은 rowData를 인자로 외부로 전달
 *
 * * 동작 규칙
 *   * 클릭(onClick)
 *     * `disabled`면 클릭 이벤트를 차단
 *     * 활성 상태면 전달된 `onClick(e)`를 그대로 호출
 *   * 더블클릭(onDoubleClick)
 *     * `disabled`면 더블클릭 이벤트를 차단
 *     * 활성 상태면 `onDoubleClick?.(rowData)` 형태로 “rowData(T | null)”를 인자로 전달
 *   * rowData
 *     * 미지정 시 기본값은 `null`
 *     * 더블클릭 핸들러에서만 사용(단일 진입점)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 레이아웃: `display: grid` + `grid-template-columns: columns`로 컬럼 구조를 강제
 *   * 높이: `rowHeight > 0`인 경우 height/min-height/max-height를 동일 px로 고정(고정 행 높이 전제)
 *   * 기본 스타일: 하단 border + white 배경
 *   * stickyBottom
 *     * `stickyBottom`이 true면 `position: sticky`로 하단 고정
 *     * `bottom`은 `stickyBottomOffset(px)` 값을 사용
 *     * z-index 및 상단 경계 표현을 위해 `box-shadow`로 border 라인을 보강
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `columns`는 grid 템플릿 정의 문자열(필수)이며 행 레이아웃의 기준 값
 *     * `rowHeight`는 virtualization/고정 높이 운영을 위한 “표시용 높이 고정” 파라미터
 *     * `stickyBottomOffset`은 summary/footer row 등 하단 고정 행의 누적 offset(px) 계산 결과를 전달받음
 *   * 내부 계산 로직
 *     * 이벤트 핸들러는 disabled 가드만 수행하고, 나머지 동작은 호출부 계약을 그대로 따름
 *
 * @module TableTr
 * Grid 기반 Table에서 행 단위 레이아웃(컬럼 그리드/고정 높이/하단 sticky)과 이벤트 전달을 담당하는 컴포넌트
 *
 * @usage
 * <TableTr
 *   columns="120px 1fr 160px"
 *   rowHeight={32}
 *   rowData={row}
 *   onDoubleClick={(r) => ...}
 * >
 *   {cells}
 * </TableTr>
 *
/---------------------------------------------------------------------------**/
const TableTr = <T,>({
  onClick,
  onDoubleClick,
  children,
  selected,
  disabled,
  rowData = null,
  rowHeight,
  columns,
  stickyBottom,
  stickyBottomOffset,
  ...others
}: TableTrProps<T>) => {
  // * 더블클릭 이벤트를 disabled 상태를 고려해 안전하게 전달
  const handleDoubleClick = () => {
    if (disabled) return
    onDoubleClick?.(rowData)
  }

  // * 클릭 이벤트를 disabled 상태를 고려해 안전하게 전달
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
      $rowHeight={rowHeight}
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
    $rowHeight?: number
    $stickyBottom?: boolean
    $stickyBottomOffset: number
  }
>`
  ${BaseMixin};

  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  align-items: center;

  /* * rowHeight가 주어지면 고정 높이로, 없으면 auto로 유지 */
  height: ${({ $rowHeight }) => ($rowHeight && $rowHeight > 0 ? `${$rowHeight}px` : "auto")};
  min-height: ${({ $rowHeight }) => ($rowHeight && $rowHeight > 0 ? `${$rowHeight}px` : "auto")};
  max-height: ${({ $rowHeight }) => ($rowHeight && $rowHeight > 0 ? `${$rowHeight}px` : "none")};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.grayscale.white};

  /* * stickyBottom 활성화 시 하단 고정(요약/합계 행 등) */
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
