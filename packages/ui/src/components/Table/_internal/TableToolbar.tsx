import { type ReactNode, useState } from "react"
import Flex from "../../Flex/Flex"
import IconButton from "../../IconButton/IconButton"
import Divider from "../../Divider/Divider"
import TableSearch from "./TableSearch"
import TableColumnVisible from "./TableColumnVisible"
import TableFilter from "./TableFilter"
import Badge from "../../Badge/Badge"
import { Typography } from "../../Typography/Typography"
import { theme } from "../../../tokens/theme"
import TableExport from "./TableExport"

export type TableToolBarProps<TExtraExportType extends string = never> = {
  title?: string
  disabled?: boolean

  // search
  searchEnabled?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void

  // export (단일 진입점: type만 올림. ctx는 Table.tsx가 단일 구성)
  exportEnabled?: boolean
  exportItems?: { type: any; label: string; icon?: string }[]
  excludeExportTypes?: any[]
  onExport?: (type: any) => void

  // columns visible
  columnVisibilityEnabled?: boolean
  columns?: { key: string; title: string; hideable?: boolean }[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  onHiddenColumnKeysChange?: (hiddenKeys: string[], hiddenColumns: any[]) => void
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number

  // filter
  filterEnabled?: boolean
  filterActiveCount?: number
  filterOpen?: boolean
  onFilterOpenChange?: (open: boolean) => void
  filterDrawerVariant?: any
  filterDrawerPlacement?: any
  filterDrawerWidth?: number | string
  filterDrawerHeight?: number | string
  filterSkeletonEnabled?: boolean
  filterSkeletonCount?: number
  onFilterSearch?: () => void
  onFilterReset?: () => void
  filterContent?: ReactNode

  // export ctx는 toolbar prop으로만 유지(실제 ctx merge는 Table.tsx에서 수행)
  exportContext?: unknown
}
/**---------------------------------------------------------------------------/
 *
 * ! TableToolBar
 *
 * * Table 상단 유틸 영역(컬럼 표시/필터/내보내기/검색)을 한 줄로 구성해 제공하는 툴바 컴포넌트
 * * 각 기능은 `*_Enabled` 플래그와 필수 콜백 존재 여부에 따라 “노출/비노출” 및 “동작 가능” 여부가 결정됨
 * * 필터 열림 상태는 `filterOpen` 제공 여부에 따라 controlled / uncontrolled를 모두 지원
 *
 * * 동작 규칙
 *   * 표시 우선순위(좌→우): title → column visibility → filter → export → search
 *   * disabled 처리
 *     * 필터 토글: `disabled`면 열림/닫힘 변경을 차단
 *     * 그 외 버튼/컴포넌트: 각 하위 컴포넌트에 `disabled`를 전달해 상위에서 일괄 비활성화
 *   * 필터 open 제어 방식
 *     * controlled: `filterOpen`이 boolean이면 내부 state 사용하지 않고 `onFilterOpenChange(next)`만 호출
 *     * uncontrolled: `filterOpen`이 undefined이면 내부 `uncontrolledFilterOpen`으로 상태 관리 후 콜백도 함께 호출
 *   * 필터 토글 클릭: 현재 `effectiveFilterOpen`을 반전하여 `setFilterOpenSafe(!effectiveFilterOpen)` 호출
 *   * export 활성 조건: `exportEnabled && onExport && exportItems.length > 0`일 때만 Export UI 렌더링
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 툴바 컨테이너: border + radius + white background, `zIndex`를 tooltip 레벨로 설정
 *   * 기능 그룹 구분: filter/export 앞에 세로 Divider를 넣어 시각적으로 분리
 *   * filter 배지: `filterActiveCount > 0`일 때만 count를 표시(0이면 숨김)
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * search: `searchValue`/`onSearchChange`를 외부 제어로 전달(툴바는 값 가공 없음)
 *     * export: 툴바는 “type 단일 진입점”만 유지하며 실제 ctx 구성/merge는 상위(Table.tsx) 책임
 *     * column visibility: columns/visibleColumnKeys 등 상태는 외부 제어를 기본으로 전달
 *     * filter: drawer variant/placement/size 및 content는 그대로 하위(TableFilter)로 전달
 *   * 내부 계산 로직
 *     * `effectiveFilterOpen`: controlled 여부에 따른 실제 open 값 결정
 *     * `canExport`: export 렌더 가능 여부 계산
 *
 * @module TableToolBar
 * Table의 상단 유틸(컬럼 표시/필터/내보내기/검색) 컨트롤을 단일 바(bar)로 제공하는 컴포넌트
 *
 * @usage
 * <TableToolBar
 *   title="Title"
 *   searchValue={q}
 *   onSearchChange={setQ}
 *   filterActiveCount={n}
 *   onFilterOpenChange={setOpen}
 *   exportItems={items}
 *   onExport={(type) => ...}
 * />
 *
/---------------------------------------------------------------------------**/

const TableToolBar = <TExtraExportType extends string = never>({
  title,
  disabled,

  searchEnabled = true,
  searchValue,
  searchPlaceholder,
  onSearchChange,

  exportEnabled = true,
  exportItems,
  excludeExportTypes,
  onExport,

  columnVisibilityEnabled = true,
  columns = [],
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,
  onHiddenColumnKeysChange,
  columnsSkeletonEnabled = true,
  columnsSkeletonCount = 6,

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
}: TableToolBarProps<TExtraExportType>) => {
  const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false)

  // * filterOpen이 boolean으로 들어오면 controlled 모드로 판단
  const isFilterControlled = typeof filterOpen === "boolean"

  // * controlled/uncontrolled 여부에 따라 실제 사용 open 값을 단일 값으로 정규화
  const effectiveFilterOpen = isFilterControlled ? (filterOpen as boolean) : uncontrolledFilterOpen

  // * filter open 상태 변경 시 disabled/feature enabled 및 controlled/uncontrolled 규약을 지켜 안전하게 반영
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

  // * export 사용 가능 조건(기능 on + 핸들러 존재 + 아이템 존재)을 단일 플래그로 정규화
  const canExport = Boolean(exportEnabled && onExport && (exportItems?.length ?? 0) > 0)

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        mb={0}
        p={"2px 5px"}
        bgColor={theme.colors.grayscale.white}
        sx={{
          position: "relative",
          zIndex: theme.zIndex?.tooltip,
          borderRadius: theme.borderRadius[4],
          border: `1px solid ${theme.colors.border.default}`,
        }}
      >
        {/* * title이 있을 때만 헤더 타이틀 렌더링 */}
        {title ? (
          <Typography variant="b1Bold" text={title} ml={4} sx={{ fontSize: "1.2rem" }} />
        ) : null}

        <Flex align="center" justify="flex-end" gap={6} sx={{ minWidth: 0, flex: 1 }}>
          {/* * 컬럼 표시/숨김 컨트롤 */}
          {columnVisibilityEnabled ? (
            <TableColumnVisible
              disabled={disabled}
              columnVisibilityEnabled={columnVisibilityEnabled}
              columns={columns}
              visibleColumnKeys={visibleColumnKeys}
              defaultVisibleColumnKeys={defaultVisibleColumnKeys}
              onVisibleColumnKeysChange={onVisibleColumnKeysChange}
              onHiddenColumnKeysChange={onHiddenColumnKeysChange}
              columnsSkeletonEnabled={columnsSkeletonEnabled}
              columnsSkeletonCount={columnsSkeletonCount}
              onBeforeOpen={() => {}}
            />
          ) : null}

          {/* * 필터 트리거(뱃지로 활성 필터 수 표시) */}
          {filterEnabled ? (
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
                  onClick={() => setFilterOpenSafe(!effectiveFilterOpen)}
                />
              </Badge>
            </Flex>
          ) : null}

          {/* * export 트리거(아이템이 있을 때만 노출) */}
          {canExport ? (
            <Flex align="center" gap={6}>
              <Divider direction="vertical" height={17} thickness="1px" />
              <TableExport<TExtraExportType>
                disabled={disabled}
                exportEnabled={exportEnabled}
                exportItems={exportItems}
                excludeExportTypes={excludeExportTypes}
                onExport={(type) => onExport?.(type)}
                onBeforeOpen={() => {}}
              />
            </Flex>
          ) : null}

          {/* * 검색 트리거/입력 */}
          {searchEnabled ? (
            <TableSearch
              disabled={disabled}
              searchEnabled={searchEnabled}
              searchValue={searchValue}
              searchPlaceholder={searchPlaceholder}
              onSearchChange={onSearchChange}
              onBeforeOpen={() => {}}
            />
          ) : null}
        </Flex>
      </Flex>

      {/* * 필터 패널(트리거는 상단에서 제어하고, 여기서는 hideTrigger로 내용만 렌더링) */}
      {filterEnabled ? (
        <TableFilter
          disabled={disabled}
          filterEnabled={filterEnabled}
          filterActiveCount={filterActiveCount}
          filterOpen={effectiveFilterOpen}
          onFilterOpenChange={setFilterOpenSafe}
          filterDrawerVariant={filterDrawerVariant}
          filterDrawerPlacement={filterDrawerPlacement}
          filterDrawerWidth={filterDrawerWidth}
          filterDrawerHeight={filterDrawerHeight}
          filterSkeletonEnabled={filterSkeletonEnabled}
          filterSkeletonCount={filterSkeletonCount}
          onFilterSearch={onFilterSearch}
          onFilterReset={onFilterReset}
          filterContent={filterContent}
          onBeforeOpen={() => {}}
          hideTrigger
        />
      ) : null}
    </>
  )
}

export default TableToolBar
