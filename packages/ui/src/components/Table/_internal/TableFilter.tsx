import { ReactNode, useMemo, useState } from "react"
import Flex from "../../Flex/Flex"
import IconButton from "../../IconButton/IconButton"
import { styled } from "../../../tokens/customStyled"
import { theme } from "../../../tokens/theme"
import Divider from "../../Divider/Divider"
import Drawer, { DrawerCloseBehavior, DrawerVariant } from "../../Drawer/Drawer"
import type { AxisPlacement } from "../../../types"
import ScrollBox from "../../ScrollBox/ScrollBox"
import Skeleton from "../../Skeleton/Skeleton"
import Badge from "../../Badge/Badge"
import { toCssValue } from "../../../utils/string"

export type TableFilterProps = {
  disabled?: boolean

  filterEnabled?: boolean
  filterActiveCount?: number
  filterOpen?: boolean
  onFilterOpenChange?: (open: boolean) => void

  filterDrawerVariant?: DrawerVariant
  filterDrawerPlacement?: AxisPlacement
  filterDrawerCloseBehavior?: DrawerCloseBehavior
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

* ! TableFilter
*
* * 테이블 툴바 영역에서 필터 UI를 토글로 열고 닫는 컴포넌트
* * Drawer 기반으로 필터 패널을 렌더링하며 variant/placement/closeBehavior/size를 외부에서 제어
* * controlled/uncontrolled(open) 패턴 지원
*   * filterOpen 제공 시 controlled
*   * 미제공 시 내부 state(uncontrolledFilterOpen)로 관리
* * 필터 활성 개수(filterActiveCount)를 Badge로 표시
* * onBeforeOpen 훅으로 열기 직전에 외부 팝오버/드로어 정리 시나리오 지원
* * hideTrigger=true면 트리거(툴바 버튼/Divider/Badge)는 렌더하지 않고 패널만 렌더링
*
* * 열림/닫힘 처리
*   * setFilterOpenSafe: disabled/filterEnabled 가드 + controlled 여부에 따라 상태/콜백 처리
*   * toggleFilter: 열기 직전 onBeforeOpen 호출 후 open 토글
*
* * Skeleton 처리
*   * filterSkeletonEnabled + (disabled || !filterContent) 조건일 때 스켈레톤 렌더링
*   * filterSkeletonCount 만큼 행을 생성해 로딩/비활성 상태를 시각화
*
* * 레이아웃/애니메이션
*   * FilterSlot: placement에 따라 height(top/bottom) 또는 width(left/right) 애니메이션으로 공간을 확보
*   * FilterInner: scaleY/opacity 전환으로 패널 표시감을 보강
*   * placement가 top/bottom이면 세로 슬롯(100% width), 좌/우면 가로 슬롯(100% height)
*   * toCssValue로 drawerWidth/drawerHeight를 안전한 css 문자열로 변환해 슬롯 크기 계산
*
* * Drawer 내부 구성
*   * 상단 컨트롤: 검색(SearchLine), 초기화(reset), 닫기(CloseLine) 아이콘 버튼 제공
*   * ScrollBox로 컨텐츠 영역 최대 높이 제한 + 스크롤 처리
*   * Divider로 섹션 구분 및 테두리/배경을 theme 기반으로 적용
*
* @module TableFilter
* 테이블의 필터 패널을 표시/숨김 처리하는 UI 컴포넌트입니다.
*
* @usage
* <TableFilter filterContent={<MyFilter />} onFilterSearch={...} onFilterReset={...} />
* <TableFilter filterOpen={open} onFilterOpenChange={setOpen} filterActiveCount={3} />
* <TableFilter hideTrigger filterOpen={open} onFilterOpenChange={setOpen} />

/---------------------------------------------------------------------------**/

const TableFilter = ({
  disabled,

  filterEnabled = true,
  filterActiveCount = 0,
  filterOpen,
  onFilterOpenChange,

  filterDrawerVariant = "flex",
  filterDrawerPlacement = "top",
  filterDrawerCloseBehavior = "hidden",
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
              closeBehavior={filterDrawerCloseBehavior}
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
