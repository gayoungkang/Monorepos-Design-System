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
 * * Grid 기반 Table 레이아웃에서 개별 셀(Cell)을 표현하는 컴포넌트
 * * BaseMixinProps를 확장하여 padding, margin, width, sx 등 공통 스타일 속성 지원
 *
 * * 정렬 처리
 *   * align(TableCellAlign)을 normalizeAlign 유틸로 보정하여 사용
 *   * justify-content 기반으로 셀 내부 정렬 제어
 *
 * * colspan 처리
 *   * colSpan 값이 1보다 큰 경우 gridColumn: span N 형태로 동적 적용
 *   * Grid 레이아웃 환경에서 table colspan 역할을 대체
 *
 * * sticky bottom 지원 (SummaryRow 용도)
 *   * stickyBottom=true 인 경우 position: sticky + bottom 적용
 *   * stickyBottomOffset으로 하단 고정 위치를 누적 계산 가능
 *   * SummaryRow 다중 라인 스택 시 하단에서 위로 밀려 올라가는 구조 지원
 *
 * * 상태 표현
 *   * disabled=true: 텍스트 색상 비활성화, 인터랙션 차단
 *   * clickable=true && !disabled: pointer 커서 적용
 *   * selected 플래그는 외부 스타일 확장 여지로 전달만 유지
 *
 * * 스타일 구조
 *   * inline-flex 기반 셀
 *   * 우측 border 기본 적용, 마지막 셀은 border 제거
 *   * word-wrap / pre-wrap으로 줄바꿈 허용
 *
 * @module TableTd
 * Grid 기반 테이블에서 셀 단위를 표현하며,
 * summary row, sticky bottom, colspan 등 확장 요구사항을 지원합니다.
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
        $stickyBottomOffset={bottom}
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
    $stickyBottomOffset?: string
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
        bottom: ${$stickyBottomOffset ?? "0px"};
        z-index: ${theme.zIndex?.sticky};
      `
      : ""}

  &:last-child {
    border-right: none;
  }
`
TableTd.displayName = "TableTd"
export default TableTd
