import { HTMLAttributes, ReactNode, useMemo } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { IconName } from "../Icon/icon-loader"
import { Typography } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"

export type PaginationType = "Table" | "Basic"

export type PaginationProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    type: PaginationType
    disabled?: boolean

    // * Table: from-to 표시 + prev/next
    count?: number
    page?: number // 1-based
    onPageChange?: (page: number) => void
    labelDisplayedRows?: (from: number, to: number, count: number) => ReactNode

    // * Basic: 페이지 번호/ellipsis 구성
    pageCount?: number
    siblingCount?: number
    boundaryCount?: number
    hidePrevNextButtons?: boolean
    hideFirstLastButtons?: boolean
    showFirstLastButtons?: boolean
    showPrevNextButtons?: boolean

    // * icons: 네비게이션 아이콘 커스터마이즈
    icons?: Partial<{
      prev: IconName
      next: IconName
      first: IconName
      last: IconName
    }>
  }

// * 값을 min~max 범위로 고정
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

// * start~end 구간의 연속 숫자 배열 생성
const range = (start: number, end: number) => {
  const out: number[] = []
  for (let i = start; i <= end; i += 1) out.push(i)
  return out
}

// * sibling/boundary 규칙으로 Basic 타입의 페이지 아이템(ellipsis 포함)을 계산
const getBasicItems = (
  page: number,
  count: number,
  siblingCount: number,
  boundaryCount: number,
) => {
  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  )

  const items: Array<number | "start-ellipsis" | "end-ellipsis"> = []

  items.push(...startPages)

  if (siblingsStart > boundaryCount + 2) items.push("start-ellipsis")
  else if (boundaryCount + 1 < count - boundaryCount) items.push(boundaryCount + 1)

  items.push(...range(siblingsStart, siblingsEnd))

  if (siblingsEnd < count - boundaryCount - 1) items.push("end-ellipsis")
  else if (count - boundaryCount > boundaryCount) items.push(count - boundaryCount)

  items.push(...endPages)

  // * 연속으로 중복된 숫자 제거 (start/end 경계에서 발생 가능)
  const dedup: Array<number | "start-ellipsis" | "end-ellipsis"> = []
  for (const it of items) {
    const prev = dedup[dedup.length - 1]
    if (typeof it === "number" && typeof prev === "number" && it === prev) continue
    dedup.push(it)
  }

  return dedup
}
/**---------------------------------------------------------------------------/

* ! Pagination
*
* * 2가지 형태를 지원하는 Pagination 컴포넌트 (Table / Basic)
* * disabled 상태 지원 (버튼/페이지 이동 비활성화)
*
* * 공통 로직
*   * clamp로 page 값을 1~pageCount 범위로 보정
*   * count 기반 총 페이지 수(computedPageCount) 계산 (기본 페이지 크기 10 고정)
*   * from/to 계산을 통해 현재 페이지의 표시 범위 텍스트 생성
*   * labelDisplayedRows로 표시 문구 커스터마이징 지원
*   * icons(prev/next/first/last) 커스터마이징 지원 (기본 아이콘 포함)
*
* * Table 타입
*   * "from–to of count" 형태의 요약 텍스트 표시
*   * prev/next IconButton으로 페이지 이동(onPageChange) 제공
*
* * Basic 타입
*   * siblingCount / boundaryCount 규칙 기반 페이지 번호/ellipsis 목록 계산(getBasicItems)
*   * first/last, prev/next 버튼 노출 옵션 제어
*   * 현재 페이지는 aria-current 및 선택 스타일 적용
*
* @module Pagination
* 테이블/리스트 페이지 이동 UI를 제공하는 Pagination 컴포넌트입니다.
* - `type`에 따라 요약형(Table) 또는 번호형(Basic) UI를 렌더링합니다.
* - `count`와 `page`를 기반으로 현재 표시 구간을 계산하며, 페이지 크기는 10으로 고정됩니다.
* - `Basic` 모드에서는 boundary/sibling 규칙에 따라 페이지 버튼과 ellipsis를 구성합니다.
*
* @usage
* <Pagination type="Table" count={120} page={1} onPageChange={...} />
* <Pagination type="Basic" page={3} pageCount={20} onPageChange={...} />

/---------------------------------------------------------------------------**/

const Pagination = ({
  type,
  disabled = false,

  count,
  page,
  onPageChange,
  labelDisplayedRows,

  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
  hidePrevNextButtons = false,
  hideFirstLastButtons = false,
  showFirstLastButtons = false,
  showPrevNextButtons = true,
  icons,
  ...baseProps
}: PaginationProps) => {
  // * 기본 아이콘 fallback 구성
  const iconPrev = icons?.prev ?? ("ArrowLeft" as IconName)
  const iconNext = icons?.next ?? ("ArrowRight" as IconName)
  const iconFirst = icons?.first ?? ("FirstPageArrow" as IconName)
  const iconLast = icons?.last ?? ("LastPageArrow" as IconName)

  // * count 안전값 보정
  const safeCount = typeof count === "number" ? Math.max(0, count) : 0

  // * pageCount 우선, 없으면 count 기반으로 페이지 수 계산 (Table 타입 기본 10개 단위)
  const computedPageCount = useMemo(() => {
    if (typeof pageCount === "number" && pageCount > 0) return Math.floor(pageCount)
    if (safeCount <= 0) return 1
    return Math.max(1, Math.ceil(safeCount / 10))
  }, [pageCount, safeCount])

  // * 입력 page를 1~computedPageCount 범위로 보정
  const safePage = useMemo(() => {
    const p = typeof page === "number" ? page : 1
    return clamp(p, 1, computedPageCount)
  }, [page, computedPageCount])

  // * Table 타입의 from/to 계산 (기본 10개 단위)
  const fromTo = useMemo(() => {
    if (safeCount <= 0) return { from: 0, to: 0 }
    const from = (safePage - 1) * 10 + 1
    const to = Math.min(safeCount, safePage * 10)
    return { from, to }
  }, [safeCount, safePage])

  // * Table 타입 표시 문구 계산 (사용자 formatter 우선)
  const displayedRows = useMemo(() => {
    if (!safeCount) return "0–0 of 0"
    if (labelDisplayedRows) return labelDisplayedRows(fromTo.from, fromTo.to, safeCount)
    return `${fromTo.from}–${fromTo.to} of ${safeCount}`
  }, [fromTo.from, fromTo.to, safeCount, labelDisplayedRows])

  // * Basic 타입 페이지 아이템 계산
  const basicItems = useMemo(() => {
    return getBasicItems(safePage, computedPageCount, siblingCount, boundaryCount)
  }, [safePage, computedPageCount, siblingCount, boundaryCount])

  // * 이전/다음 이동 가능 여부
  const canPrev = safePage > 1
  const canNext = safePage < computedPageCount

  // * Table 타입 렌더링
  const renderTable = () => (
    <Flex align="center" gap={12} width={"fit-content"}>
      <Typography
        text={displayedRows as string}
        variant="b1Bold"
        color={theme.colors.text.primary}
      />

      <Flex align="center" gap={4}>
        <IconButton
          onClick={() => onPageChange?.(safePage - 1)}
          disabled={disabled || !canPrev}
          icon={iconPrev}
        />

        <IconButton
          onClick={() => onPageChange?.(safePage + 1)}
          disabled={disabled || !canNext}
          icon={iconNext}
        />
      </Flex>
    </Flex>
  )

  // * Basic 타입 렌더링
  const renderBasic = () => {
    const showPrevNext = showPrevNextButtons && !hidePrevNextButtons
    const showFirstLast = showFirstLastButtons && !hideFirstLastButtons

    return (
      <Flex align="center" gap={6} width="fit-content">
        {showFirstLast ? (
          <IconButton
            disabled={disabled || !canPrev}
            onClick={() => onPageChange?.(1)}
            icon={iconFirst}
            size={13}
          />
        ) : null}

        {showPrevNext ? (
          <IconButton
            disabled={disabled || !canPrev}
            onClick={() => onPageChange?.(safePage - 1)}
            icon={iconPrev}
            size={13}
          />
        ) : null}

        {basicItems.map((it, idx) => {
          if (it === "start-ellipsis" || it === "end-ellipsis") {
            return (
              <Flex key={`el-${it}-${idx}`} width={20} height={20} align="center" justify="center">
                <Typography variant="b1Medium" color={theme.colors.text.primary} text="…" />
              </Flex>
            )
          }

          const p = it
          const selected = p === safePage
          return (
            <PageButton
              key={`p-${p}`}
              type="button"
              $selected={selected}
              disabled={disabled}
              aria-current={selected ? "page" : undefined}
              onClick={() => onPageChange?.(p)}
            >
              <Typography
                variant={selected ? "b1Bold" : "b1Regular"}
                color={selected ? theme.colors.text.primary : theme.colors.text.secondary}
                text={`${p}`}
                sx={{ lineHeight: "1" }}
              />
            </PageButton>
          )
        })}

        {showPrevNext ? (
          <IconButton
            disabled={disabled || !canNext}
            onClick={() => onPageChange?.(safePage + 1)}
            icon={iconNext}
            size={13}
          />
        ) : null}

        {showFirstLast ? (
          <IconButton
            onClick={() => onPageChange?.(computedPageCount)}
            disabled={disabled || !canNext}
            icon={iconLast}
            size={13}
          />
        ) : null}
      </Flex>
    )
  }

  return (
    <Flex {...baseProps}>
      {type === "Table" ? renderTable() : null}
      {type === "Basic" ? renderBasic() : null}
    </Flex>
  )
}

const PageButton = styled.button<{ $selected: boolean }>`
  border: none;
  background: ${({ $selected }) => ($selected ? theme.colors.grayscale[200] : "transparent")};
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius[6]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.08s ease,
    opacity 0.15s ease;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? theme.colors.grayscale[100] : theme.colors.background.default};
  }

  &:active {
    transform: translateY(0.5px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    transform: none;
  }
`

Pagination.displayName = "Pagination"
export default Pagination
