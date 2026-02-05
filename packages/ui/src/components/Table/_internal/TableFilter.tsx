import { ReactNode, useMemo, useState } from "react"
import Flex from "../../Flex/Flex"
import IconButton from "../../IconButton/IconButton"
import { styled } from "../../../tokens/customStyled"
import { theme } from "../../../tokens/theme"
import Divider from "../../Divider/Divider"
import Drawer, { DrawerVariant } from "../../Drawer/Drawer"
import ScrollBox from "../../ScrollBox/ScrollBox"
import Skeleton from "../../Skeleton/Skeleton"
import Badge from "../../Badge/Badge"
import { toCssValue } from "../../../utils/string"

type AxisPlacement = "top" | "bottom" | "left" | "right"

export type TableFilterProps = {
  disabled?: boolean

  filterEnabled?: boolean
  filterActiveCount?: number
  filterOpen?: boolean
  onFilterOpenChange?: (open: boolean) => void

  filterDrawerVariant?: DrawerVariant
  filterDrawerPlacement?: AxisPlacement
  filterDrawerWidth?: number | string
  filterDrawerHeight?: number | string

  filterSkeletonEnabled?: boolean
  filterSkeletonCount?: number

  onFilterSearch?: () => void
  onFilterReset?: () => void

  filterContent?: ReactNode

  onBeforeOpen?: () => void

  hideTrigger?: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! TableFilter
 *
 * * 테이블 툴바에서 필터 UI를 Drawer로 제공하는 컴포넌트
 * * filterEnabled=false 인 경우 렌더링하지 않음(null 반환)
 * * hideTrigger=true 인 경우 트리거(필터 아이콘 버튼) 영역을 숨기고, 슬롯/Drawer만 렌더링
 *
 * * open 상태 관리
 *   * filterOpen이 제공되면 controlled 모드로 동작
 *   * filterOpen이 없으면 내부 상태(uncontrolledFilterOpen)로 관리
 *   * setFilterOpenSafe: disabled/filterEnabled 및 controlled 여부를 고려하여 open 상태를 안전하게 갱신
 *   * toggleFilter: 닫힘→열림 전환 시 onBeforeOpen 1회 호출 후 open 토글
 *
 * * 스켈레톤 노출 규칙
 *   * filterSkeletonEnabled=true 이면서
 *   * disabled=true 또는 filterContent가 없을 때 스켈레톤 UI를 렌더링
 *
 * * Drawer 설정
 *   * variant/placement/width/height를 props로 제어
 *   * variant="flex" 인 경우 disableBackdrop 활성화
 *   * 상단 액션: 검색(SearchLine) / 초기화(reset) / 닫기(CloseLine)
 *     - disabled 또는 핸들러 미제공 시 각 버튼 비활성화
 *
 * * 애니메이션 레이아웃(슬롯 확장/축소)
 *   * FilterSlot: placement 기준으로 height 또는 width를 0 ↔ 목표값으로 트랜지션
 *     - top/bottom: height 전환, left/right: width 전환
 *   * FilterInner: scaleY/opacity 트랜지션으로 부드러운 등장 효과
 *
 * @module TableFilter
 * 테이블 필터 영역을 Drawer 기반으로 제공합니다.
 * - 슬롯 확장/축소 애니메이션과 Drawer 조합으로 필터 UI를 표시합니다.
 * - open은 controlled/uncontrolled 모두 지원하며, 검색/초기화 액션을 제공합니다.
 *
 * @usage
 * <TableFilter
 *   filterEnabled
 *   filterActiveCount={2}
 *   onFilterSearch={() => doSearch()}
 *   onFilterReset={() => reset()}
 *   filterContent={<MyFilterFields />}
 * />
 *
 * <TableFilter
 *   filterOpen={open}
 *   onFilterOpenChange={setOpen}
 *   hideTrigger
 *   filterContent={<MyFilterFields />}
 * />
 *
/---------------------------------------------------------------------------**/

const TableFilter = ({
  disabled,

  filterEnabled = true,
  filterActiveCount = 0,
  filterOpen,
  onFilterOpenChange,

  filterDrawerVariant = "flex",
  filterDrawerPlacement = "top",
  filterDrawerWidth = 360,
  filterDrawerHeight = 220,

  filterSkeletonEnabled = true,
  filterSkeletonCount = 2,

  onFilterSearch,
  onFilterReset,
  filterContent,

  onBeforeOpen,

  hideTrigger = false,
}: TableFilterProps) => {
  const isFilterControlled = filterOpen !== undefined
  const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false)
  const effectiveFilterOpen = isFilterControlled ? Boolean(filterOpen) : uncontrolledFilterOpen

  // * disabled/filterEnabled/controlled 여부를 고려하여 open 상태를 안전하게 갱신
  const setFilterOpenSafe = (next: boolean) => {
    if (disabled) return
    if (!filterEnabled) return

    if (isFilterControlled) {
      onFilterOpenChange?.(next)
      return
    }

    setUncontrolledFilterOpen(next)
    onFilterOpenChange?.(next)
  }

  // * 필터 버튼 클릭 시 토글(열릴 때 onBeforeOpen 훅 호출)
  const toggleFilter = () => {
    if (disabled) return
    if (!filterEnabled) return

    if (!effectiveFilterOpen) onBeforeOpen?.()
    setFilterOpenSafe(!effectiveFilterOpen)
  }

  // * disabled 상태이거나 콘텐츠가 없을 때 스켈레톤을 노출
  const shouldShowFilterSkeleton = useMemo(() => {
    if (!filterEnabled) return false
    if (!filterSkeletonEnabled) return false
    return !!disabled || !filterContent
  }, [filterEnabled, filterSkeletonEnabled, disabled, filterContent])

  // * placement에 따라 슬롯(애니메이션 영역)의 width/height를 계산
  const isVerticalPlacement = filterDrawerPlacement === "top" || filterDrawerPlacement === "bottom"

  const filterSlotWidth: string = isVerticalPlacement
    ? "100%"
    : (toCssValue(filterDrawerWidth) ?? "0px")

  const filterSlotHeight: string = isVerticalPlacement
    ? (toCssValue(filterDrawerHeight) ?? "0px")
    : "100%"

  return (
    <>
      {!hideTrigger && filterEnabled && (
        <Flex align="center" gap={6}>
          <Divider direction="vertical" height={17} thickness="1px" />
          <Badge
            content={filterActiveCount > 0 ? filterActiveCount : undefined}
            showZero={false}
            status="info"
            placement="top-right"
          >
            <IconButton
              icon="Filter"
              disabled={disabled}
              disableInteraction={false}
              toolTip="필터"
              onClick={toggleFilter}
            />
          </Badge>
        </Flex>
      )}

      {filterEnabled && (
        <FilterSlot
          $open={effectiveFilterOpen}
          $placement={filterDrawerPlacement}
          $width={filterSlotWidth}
          $height={filterSlotHeight}
        >
          <FilterInner $open={effectiveFilterOpen}>
            <Drawer
              open={effectiveFilterOpen}
              onClose={() => setFilterOpenSafe(false)}
              variant={filterDrawerVariant}
              placement={filterDrawerPlacement}
              width={filterDrawerWidth}
              height={filterDrawerHeight}
              disableBackdrop={filterDrawerVariant === "flex"}
              boxShadow={theme.shadows.elevation[0]}
              sx={{
                border: `1px solid ${theme.colors.border.default}`,
                backgroundColor: theme.colors.background.default,
              }}
            >
              <Flex width="100%" direction="column" p="10px">
                <Flex align="center" justify="space-between" mb={4}>
                  <Flex align="center" gap={6}>
                    <IconButton
                      icon="SearchLine"
                      toolTip="검색"
                      disabled={disabled || !onFilterSearch}
                      onClick={() => {
                        if (disabled) return
                        onFilterSearch?.()
                      }}
                    />
                    <IconButton
                      icon="reset"
                      toolTip="초기화"
                      disabled={disabled || !onFilterReset}
                      onClick={() => {
                        if (disabled) return
                        onFilterReset?.()
                      }}
                    />
                  </Flex>

                  <IconButton
                    icon="CloseLine"
                    toolTip="닫기"
                    disableInteraction={false}
                    disabled={disabled}
                    onClick={() => setFilterOpenSafe(false)}
                  />
                </Flex>

                <Divider mb={10} />

                <ScrollBox maxHeight="150px">
                  {shouldShowFilterSkeleton ? (
                    <Flex direction="column" gap={12} p="6px 0 12px 0">
                      {Array.from({ length: Math.max(1, filterSkeletonCount) }).map((_, i) => (
                        <Flex width="100%" key={`filter_skel_${i}`} align="center" gap={10}>
                          <Skeleton variant="rectangular" width={160} height={34} />
                          <Skeleton variant="rectangular" width={160} height={34} />
                          <Skeleton variant="rectangular" width={200} height={34} />
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Flex direction="column" gap={10} p="6px 0 12px 0">
                      {filterContent}
                    </Flex>
                  )}
                </ScrollBox>
              </Flex>
            </Drawer>
          </FilterInner>
        </FilterSlot>
      )}
    </>
  )
}

const FilterSlot = styled.div<{
  $open: boolean
  $placement: AxisPlacement
  $width: string
  $height: string
}>`
  overflow: hidden;
  margin-top: -4px;

  ${({ $placement, $open, $width, $height }) => {
    const isVertical = $placement === "top" || $placement === "bottom"
    if (isVertical) {
      return `
        width: 100%;
        height: ${$open ? $height : "0px"};
        transition: height 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
        will-change: height;
      `
    }

    return `
      height: 100%;
      width: ${$open ? $width : "0px"};
      transition: width 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
      will-change: width;
    `
  }}
`

const FilterInner = styled.div<{ $open: boolean }>`
  transform-origin: top center;
  transform: ${({ $open }) => ($open ? "scaleY(1)" : "scaleY(0.96)")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition:
    transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 140ms ease;
  will-change: transform, opacity;
`

export default TableFilter
