import { HTMLAttributes, ReactNode, forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import { styled } from "../../../tokens/customStyled"
import { theme } from "../../../tokens/theme"
import { normalizeAlign } from "../@utils/table"
import { TableCellAlign } from "../@Types/table"

export type TableTdProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    children?: ReactNode
    align?: TableCellAlign
    colSpan?: number
    disabled?: boolean
    stickyBottom?: boolean
    stickyBottomOffset?: number | string
    clickable?: boolean
    selected?: boolean
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableTd
 *
 * * Grid 기반 Table에서 단일 셀(Td) 역할을 하는 컴포넌트
 * * BaseMixinProps를 지원하며, 컨텐츠/정렬/비활성/colSpan/stickyBottom 등을 처리
 *
 * * 정렬 처리
 *   * align(TableCellAlign)을 normalizeAlign로 CSS align 값으로 변환
 *   * Root에서는 justify-content로 정렬을 적용(좌/중/우)
 *
 * * colSpan 처리
 *   * colSpan > 1 인 경우 style에 gridColumn: `span ${colSpan}`를 주입하여
 *     grid 레이아웃에서 셀 병합을 구현
 *
 * * disabled 처리
 *   * disabled=true 인 경우 텍스트 컬러를 theme.colors.text.disabled로 변경
 *   * 클릭 가능 상태($clickable)는 disabled일 때 무시(커서 미적용)
 *
 * * clickable 처리
 *   * clickable=true && !disabled 인 경우 cursor: pointer 적용
 *   * 실제 클릭 핸들러는 상위(TableRow 등)에서 Root에 전달되는 onClick으로 처리
 *
 * * stickyBottom 처리(하단 고정 요약/합계 행 지원)
 *   * stickyBottom=true 인 경우 position: sticky + bottom 적용
 *   * stickyBottomOffset은 number|string 모두 지원
 *     - number면 `${n}px`로 변환
 *     - string이면 그대로 사용
 *   * z-index는 theme.zIndex?.sticky를 사용
 *
 * * 스타일 기본값
 *   * display: inline-flex + padding: 10px 12px
 *   * border-right로 셀 구분선을 만들고 마지막 셀은 제거
 *   * word-wrap/white-space/pre-wrap 및 min-width:0으로 텍스트/오버플로우 안정화
 *   * 배경은 theme.colors.grayscale.white 고정
 *
 * @module TableTd
 * Grid 기반 테이블 셀을 렌더링합니다.
 * - align/colSpan/disabled/stickyBottom 옵션을 제공하며, BaseMixin 스타일을 적용합니다.
 * - 합계/요약 행의 하단 고정(stickyBottom) 및 컬럼 병합(colSpan)을 지원합니다.
 *
 * @usage
 * <TableTd align="right">123</TableTd>
 * <TableTd colSpan={2}>Merged</TableTd>
 * <TableTd stickyBottom stickyBottomOffset={32}>SUM</TableTd>
 *
/---------------------------------------------------------------------------**/

const TableTd = forwardRef<HTMLDivElement, TableTdProps>(
  (
    {
      children,
      align,
      colSpan,
      disabled,
      stickyBottom,
      stickyBottomOffset,
      clickable,
      selected,
      ...baseProps
    },
    ref,
  ) => {
    // * TableCellAlign을 실제 CSS align 값으로 정규화
    const safeAlign = normalizeAlign(align)

    // * stickyBottom 활성화 시 bottom offset을 px 문자열로 안전 변환
    const bottom =
      stickyBottom && stickyBottomOffset !== undefined
        ? typeof stickyBottomOffset === "number"
          ? `${stickyBottomOffset}px`
          : stickyBottomOffset
        : "0px"

    return (
      <Root
        ref={ref}
        {...baseProps}
        $align={safeAlign}
        $disabled={disabled}
        $stickyBottom={stickyBottom}
        $stickyBottomOffset={bottom ?? "0px"}
        $clickable={clickable}
        $selected={selected}
        style={{
          ...(baseProps.style ?? {}),
          ...(colSpan && colSpan > 1 ? { gridColumn: `span ${colSpan}` } : {}),
        }}
      >
        {children}
      </Root>
    )
  },
)

const Root = styled.div<
  BaseMixinProps & {
    $align?: TableCellAlign
    $disabled?: boolean
    $stickyBottom?: boolean
    $stickyBottomOffset: string
    $clickable?: boolean
    $selected?: boolean
  }
>`
  ${BaseMixin};

  display: inline-flex;
  padding: 10px 12px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ $disabled }) => ($disabled ? theme.colors.text.disabled : theme.colors.text.primary)};
  justify-content: ${({ $align }) => $align ?? "left"};
  word-wrap: break-word;
  white-space: pre-wrap;
  min-width: 0;
  background-color: ${theme.colors.grayscale.white};

  ${({ $clickable, $disabled }) =>
    $clickable && !$disabled
      ? `
        cursor: pointer;
      `
      : ""}

  ${({ $stickyBottom, $stickyBottomOffset }) =>
    $stickyBottom
      ? `
        position: sticky;
        bottom: ${$stickyBottomOffset};
        z-index: ${theme.zIndex?.sticky ?? 700};
      `
      : ""}

  &:last-child {
    border-right: none;
  }
`

TableTd.displayName = "TableTd"
export default TableTd
