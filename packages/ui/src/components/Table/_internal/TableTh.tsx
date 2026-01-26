import { CSSProperties, ReactNode } from "react"
import { SortDirection } from "../@Types/table"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import IconButton from "../../IconButton/IconButton"
import { styled } from "../../../tokens/customStyled"

export type TableThProps = BaseMixinProps & {
  children: ReactNode
  align?: CSSProperties["textAlign"]

  sortable?: boolean
  sort?: SortDirection
  onSortChange?: (direction: SortDirection) => void

  resizable?: boolean
  onResizeStart?: (e: React.MouseEvent<HTMLDivElement>) => void
}

// * 현재 sort 방향을 기준으로 다음 방향을 결정(ASC <-> DESC)
const getNextSortDirection = (current?: SortDirection): SortDirection => {
  if (current === "ASC") return "DESC"
  return "ASC"
}
/**---------------------------------------------------------------------------/
 *
 * ! TableTh
 *
 * * Grid 기반 Table Header에서 “헤더 셀”을 렌더링하는 컴포넌트
 * * 문자열 children은 `Typography(ellipsis)`로 감싸 최소 폭에서 말줄임 처리
 * * 정렬/정렬 토글(sort) UI와 컬럼 리사이즈 핸들을 옵션으로 제공
 *
 * * 동작 규칙
 *   * 정렬 가능 조건: `sortable && onSortChange`가 모두 만족될 때만 정렬 토글 UI 활성화
 *   * 정렬 토글: 아이콘 클릭 시 `getNextSortDirection(sort)`로 다음 방향을 계산해 `onSortChange(next)` 호출
 *     * current === "ASC" → "DESC"
 *     * 그 외(undefined 포함) → "ASC"
 *   * ARIA: `aria-sort`로 정렬 상태를 "ascending" | "descending" | "none" 중 하나로 노출
 *   * 리사이즈: `resizable`이 true일 때만 핸들을 렌더링하고, `onMouseDown`으로 `onResizeStart`를 전달
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Root: flex 정렬 + 고정 높이(36px) + padding + 우측 border(마지막 셀은 제거)
 *   * children 영역: `Flex`로 라벨/아이콘을 가로 배치하고 `minWidth: 0`로 축소/ellipsis가 동작하도록 보정
 *   * sort 아이콘: ASC/DESC 상태에 따라 rotate/opacity를 전환하고 transition으로 시각적 피드백 제공
 *   * ResizeHandle: absolute 배치(우측 -4px, 폭 8px)로 hit-area 확보, hover 시 배경 강조, cursor col-resize
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `children`은 헤더 라벨(문자열인 경우 ellipsis 처리)
 *     * `align`은 헤더 텍스트 정렬 기준이며, 내부 `Flex justify`에도 동일 기준으로 반영
 *     * `sort`는 현재 정렬 방향("ASC" | "DESC")을 나타내며 아이콘 표시/ARIA에 반영
 *     * `onSortChange`는 정렬 토글 결과를 외부(서버/상위 상태)로 전달하는 제어 포인트
 *     * `onResizeStart`는 드래그 시작 이벤트를 외부 로직(컬럼 폭 계산/상태 반영)으로 위임
 *
 * @module TableTh
 * Table 헤더 셀 단위로 정렬 토글 및 리사이즈 핸들을 제공하는 UI 컴포넌트
 *
 * @usage
 * <TableTh sortable sort={sort} onSortChange={setSort} resizable onResizeStart={onResizeStart}>
 *   {"Column"}
 * </TableTh>
 *
/---------------------------------------------------------------------------**/

const TableTh = ({
  children,
  align = "center",
  sortable,
  sort,
  onSortChange,
  resizable,
  onResizeStart,
  ...others
}: TableThProps) => {
  // * 정렬 가능 조건(정렬 UI + 핸들러 존재)을 단일 플래그로 정규화
  const canSort = Boolean(sortable && onSortChange)

  // * 정렬 아이콘 클릭 시 다음 방향으로 토글하여 상위에 전달
  const handleSortClick = () => {
    if (!canSort) return
    const next = getNextSortDirection(sort)
    onSortChange?.(next)
  }

  return (
    <Root
      align={align}
      role="columnheader"
      aria-sort={sort ? (sort === "ASC" ? "ascending" : "descending") : "none"}
      {...others}
    >
      <Flex align="center" justify={align as any} gap={4} sx={{ minWidth: 0 }}>
        {/* * 문자열 헤더는 Typography로 ellipsis 처리 */}
        {typeof children === "string" ? (
          <Typography ellipsis text={children} sx={{ display: "inline-block", minWidth: 0 }} />
        ) : (
          children
        )}

        {/* * 정렬 가능 시 토글 아이콘 표시(ASC/DESC 상태를 opacity/rotate로 표현) */}
        {canSort && (
          <IconButton
            icon="ArrowDown"
            onClick={handleSortClick}
            disableInteraction={false}
            sx={{
              opacity: sort ? (sort === "ASC" ? 1 : 0.3) : 0.3,
              transform: sort
                ? sort === "ASC"
                  ? "rotate(180deg)"
                  : "rotate(0deg)"
                : "rotate(0deg)",
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
          />
        )}
      </Flex>

      {/* * 컬럼 리사이즈가 활성화된 경우 드래그 핸들 렌더링 */}
      {resizable && <ResizeHandle onMouseDown={onResizeStart} />}
    </Root>
  )
}

const Root = styled.div<BaseMixinProps & { align?: string }>`
  ${BaseMixin};
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
  text-align: ${({ align }) => align || "center"};
  padding: 4px 6px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  min-width: 0;

  &:last-child {
    border-right: none;
  }
`

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grayscale[200]};
  }
`

export default TableTh
