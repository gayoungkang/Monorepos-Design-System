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
 * * Grid 기반 테이블 레이아웃에서 “셀(바디/요약 공용)”을 렌더링하는 컴포넌트
 * * `BaseMixinProps`를 통해 공통 스타일 props/sx를 지원하며, DOM(div) attributes를 함께 수용
 * * `align/colSpan/disabled/clickable/selected/stickyBottom` 등 셀의 표시/상태/동작을 props로 제어
 *
 * * 동작 규칙
 *   * 정렬: `align` 입력을 `normalizeAlign`로 정규화하여 표준 정렬 값으로 변환 후 적용
 *   * colSpan: `colSpan > 1`인 경우 `gridColumn: span N`을 style로 병합하여 그리드 셀 병합을 표현
 *   * disabled: 텍스트 컬러를 disabled 토큰으로 전환하고, clickable 커서 적용을 차단
 *   * clickable: `clickable && !disabled`일 때만 cursor:pointer를 적용(이벤트 자체는 호출부에서 처리)
 *   * selected: 선택 상태 표현을 위한 플래그(스타일 확장 포인트로 전달)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 기본 레이아웃: inline-flex + padding + 우측 border(마지막 셀은 border 제거)
 *   * 텍스트 처리: overflow hidden + ellipsis + nowrap, `min-width: 0`로 그리드 축소 허용
 *   * stickyBottom: 하단 고정이 필요한 경우 `position: sticky` + `bottom` offset + z-index 적용
 *   * stickyBottomOffset: number/string 입력을 px/string 형태로 안전 변환하여 bottom 값으로 사용
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `children`은 셀 콘텐츠로 렌더링
 *     * `align`은 테이블 정렬 값으로 정규화되어 `justify-content`에 반영
 *     * `colSpan`은 표시용 그리드 span 처리로만 사용(실제 table colSpan 동작 아님)
 *     * `stickyBottomOffset`은 stickyBottom 활성 시 bottom 계산값(픽셀/문자열)로 사용
 *
 * @module TableTd
 * Grid 기반 Table에서 셀 단위 렌더링(정렬/병합/하단 sticky/상태 표현)을 담당하는 컴포넌트
 *
 * @usage
 * <TableTd align="right" colSpan={2} stickyBottom stickyBottomOffset={32}>
 *   {content}
 * </TableTd>
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
    // * align 값을 테이블 표준 정렬 값으로 정규화
    const safeAlign = normalizeAlign(align)

    // * stickyBottom 사용 시 bottom offset을 px/string 형태로 안전하게 변환
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
        // * colSpan 기반 grid span 처리(표시용) + 사용자 style 병합
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
  align-items: center;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

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
