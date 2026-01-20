import { useMemo, useState } from "react"
import Badge from "../../Badge/Badge"
import Flex from "../../Flex/Flex"
import IconButton from "../../IconButton/IconButton"
import { Typography } from "../../Typography/Typography"
import { theme } from "../../../tokens/theme"
import Divider from "../../Divider/Divider"
import TableExport, { DefaultExportType, ExportItem, ExportType } from "./TableExport"
import TableColumnVisible, { ColumnVisibilityItem } from "./TableColumnVisible"
import TableFilter from "./TableFilter"
import type { TableFilterProps } from "./TableFilter"
import TableSearch from "./TableSearch"

export type TableExportContext = {
  visibleColumnKeys: string[]
  hiddenColumnKeys: string[]
  hiddenColumns: ColumnVisibilityItem[]
}

export type TableToolBarProps<TExtraExportType extends string = never> = {
  title?: string
  disabled?: boolean

  // * search(TableSearch로 위임)
  searchEnabled?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void

  // * export
  exportEnabled?: boolean
  exportItems?: ExportItem<ExportType<TExtraExportType>>[]
  defaultExportTypes?: DefaultExportType[]
  excludeExportTypes?: ExportType<TExtraExportType>[]
  onExport?: (type: ExportType<TExtraExportType>, context?: TableExportContext) => void

  // * column visibility
  columnVisibilityEnabled?: boolean
  columns?: ColumnVisibilityItem[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  onHiddenColumnKeysChange?: (hiddenKeys: string[], hiddenColumns: ColumnVisibilityItem[]) => void
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number

  // * filter(TableFilter로 위임)
  filterEnabled?: TableFilterProps["filterEnabled"]
  filterActiveCount?: TableFilterProps["filterActiveCount"]
  filterOpen?: TableFilterProps["filterOpen"]
  onFilterOpenChange?: TableFilterProps["onFilterOpenChange"]
  filterDrawerVariant?: TableFilterProps["filterDrawerVariant"]
  filterDrawerPlacement?: TableFilterProps["filterDrawerPlacement"]
  filterDrawerCloseBehavior?: TableFilterProps["filterDrawerCloseBehavior"]
  filterDrawerWidth?: TableFilterProps["filterDrawerWidth"]
  filterDrawerHeight?: TableFilterProps["filterDrawerHeight"]
  filterSkeletonEnabled?: TableFilterProps["filterSkeletonEnabled"]
  filterSkeletonCount?: TableFilterProps["filterSkeletonCount"]
  onFilterSearch?: TableFilterProps["onFilterSearch"]
  onFilterReset?: TableFilterProps["onFilterReset"]
  filterContent?: TableFilterProps["filterContent"]
}
/**---------------------------------------------------------------------------/
 *
 * ! TableToolBar
 *
 * * 테이블 상단에 배치되는 통합 툴바 컴포넌트
 * * 컬럼 표시/숨김, 필터, 내보내기, 검색 기능을 하나의 행(Row)으로 구성
 * * 각 기능은 독립 컴포넌트(TableColumnVisible, TableFilter, TableExport, TableSearch)로 위임
 *
 * * 주요 책임
 *   * 컬럼 표시/숨김 상태 관리
 *     * hideable 컬럼 기준으로 visible / hidden 컬럼을 계산
 *     * TableColumnVisible 에서 전달된 숨김 결과를 내부 state로 보관
 *     * export 시점에 최신 컬럼 상태를 exportContext로 합성하여 전달
 *
 *   * 필터(Filter) 제어
 *     * filterOpen 컨트롤드 / 언컨트롤드 모두 지원
 *     * 툴바 내 아이콘 버튼과 하단 TableFilter 영역을 분리 렌더링
 *
 *   * 내보내기(Export)
 *     * TableExport 컴포넌트에 위임
 *     * onExport 호출 시 현재 컬럼 가시성 컨텍스트를 함께 전달
 *
 *   * 검색(Search)
 *     * TableSearch 컴포넌트에 위임
 *     * 토글/입력/포커스 제어는 TableSearch 내부에서 처리
 *
 * * 레이아웃 구조
 *   * 좌측: title(optional)
 *   * 우측: ColumnVisible → Filter → Export → Search 순서
 *   * 각 기능 사이 Divider로 시각적 구분
 *   * Badge를 통해 숨김 컬럼 수 / 활성 필터 수 표시
 *
 * * 상태 관리 포인트
 *   * hiddenColumnKeysState / hiddenColumnsState
 *     * TableColumnVisible 에서 비동기/컨트롤드로 전달되는 숨김 결과를
 *       export 시점 정확도를 위해 내부 state로 보관
 *
 *   * exportContext(useMemo)
 *     * columns + visibleColumnKeys / defaultVisibleColumnKeys 기반 계산
 *     * 내부 state에 최신 숨김 결과가 있으면 이를 우선 적용
 *
 *   * filterOpen
 *     * 외부 제어값(filterOpen)이 있으면 컨트롤드로 동작
 *     * 없으면 내부 uncontrolled 상태로 관리
 *
 * * 상호작용 정책
 *   * disabled=true 인 경우 모든 트리거 동작 차단
 *   * 각 onBeforeOpen 훅은 다른 UI를 자동으로 닫지 않도록 비워둔 슬롯 제공
 *
 * @module TableToolBar
 * 테이블 상단에서 컬럼/필터/검색/내보내기 기능을 통합 제공하는 툴바입니다.
 *
 * @usage
 * <TableToolBar
 *   title="회원 목록"
 *   columns={columns}
 *   visibleColumnKeys={visibleKeys}
 *   onVisibleColumnKeysChange={setVisibleKeys}
 *   onExport={(type, context) => exportTable(type, context)}
 *   searchValue={q}
 *   onSearchChange={setQ}
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
  defaultExportTypes = ["excel", "csv", "pdf", "print"],
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
  filterDrawerCloseBehavior = "hidden",
  filterDrawerWidth = 360,
  filterDrawerHeight = 220,
  filterSkeletonEnabled = true,
  filterSkeletonCount = 2,
  onFilterSearch,
  onFilterReset,
  filterContent,
}: TableToolBarProps<TExtraExportType>) => {
  const isFilterControlled = filterOpen !== undefined
  const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false)
  const effectiveFilterOpen = isFilterControlled ? Boolean(filterOpen) : uncontrolledFilterOpen

  // * 컬럼 숨김 결과를 export에 전달하기 위한 내부 최신값 캐시
  const [hiddenColumnKeysState, setHiddenColumnKeysState] = useState<string[]>([])
  const [hiddenColumnsState, setHiddenColumnsState] = useState<ColumnVisibilityItem[]>([])

  // * visible/hidden 컬럼 컨텍스트 계산(컨트롤드/언컨트롤드 모두 안전)
  const exportContext = useMemo<TableExportContext>(() => {
    const hideableColumns = (columns ?? []).filter((c) => c.hideable !== false)
    const allHideableKeys = hideableColumns.map((c) => c.key)

    const fallback = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    const effectiveVisibleKeys =
      (visibleColumnKeys !== undefined ? visibleColumnKeys : fallback) ?? []

    const visibleSet = new Set(effectiveVisibleKeys)
    const computedHiddenKeys = allHideableKeys.filter((k) => !visibleSet.has(k))
    const computedHiddenColumns = hideableColumns.filter((c) => computedHiddenKeys.includes(c.key))

    // * onHiddenColumnKeysChange로 들어온 최신 값 우선(컨트롤드/비동기 업데이트 보정)
    const hiddenKeys = hiddenColumnKeysState.length ? hiddenColumnKeysState : computedHiddenKeys
    const hiddenCols = hiddenColumnsState.length ? hiddenColumnsState : computedHiddenColumns

    return {
      visibleColumnKeys: effectiveVisibleKeys,
      hiddenColumnKeys: hiddenKeys,
      hiddenColumns: hiddenCols,
    }
  }, [
    columns,
    visibleColumnKeys,
    defaultVisibleColumnKeys,
    hiddenColumnKeysState,
    hiddenColumnsState,
  ])

  // * Filter open 상태를 컨트롤드/언컨트롤드로 안전 처리
  const setFilterOpenSafe = (next: boolean) => {
    if (disabled) return
    if (!filterEnabled) return

    if (isFilterControlled) {
      onFilterOpenChange?.(next)
      return
    }

    setUncontrolledFilterOpen(next)
  }

  // * Filter 토글 클릭 핸들러
  const toggleFilter = () => {
    if (disabled) return
    if (!filterEnabled) return
    setFilterOpenSafe(!effectiveFilterOpen)
  }

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        mb={2}
        p={"2px 5px"}
        bgColor={theme.colors.grayscale.white}
        sx={{
          position: "relative",
          zIndex: theme.zIndex?.tooltip,
          borderRadius: theme.borderRadius[4],
          border: `1px solid ${theme.colors.border.default}`,
        }}
      >
        {title ? (
          <Typography variant="b1Bold" text={title} ml={4} sx={{ fontSize: "1.2rem" }} />
        ) : null}

        <Flex align="center" justify="flex-end" gap={6} sx={{ minWidth: 0, flex: 1 }}>
          {columnVisibilityEnabled ? (
            <TableColumnVisible
              disabled={disabled}
              columnVisibilityEnabled={columnVisibilityEnabled}
              columns={columns}
              visibleColumnKeys={visibleColumnKeys}
              defaultVisibleColumnKeys={defaultVisibleColumnKeys}
              onVisibleColumnKeysChange={onVisibleColumnKeysChange}
              onHiddenColumnKeysChange={(hiddenKeys, hiddenColumns) => {
                // * export 컨텍스트 동기화를 위한 내부 상태 업데이트 + 외부 콜백 전달
                setHiddenColumnKeysState(hiddenKeys)
                setHiddenColumnsState(hiddenColumns)
                onHiddenColumnKeysChange?.(hiddenKeys, hiddenColumns)
              }}
              columnsSkeletonEnabled={columnsSkeletonEnabled}
              columnsSkeletonCount={columnsSkeletonCount}
              onBeforeOpen={() => {
                // * 다른 오버레이 정리가 필요하면 여기서 처리
              }}
            />
          ) : null}

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
                  onClick={toggleFilter}
                />
              </Badge>
            </Flex>
          ) : null}

          {exportEnabled ? (
            <Flex align="center" gap={6}>
              <Divider direction="vertical" height={17} thickness="1px" />
              <TableExport<TExtraExportType>
                disabled={disabled}
                exportEnabled={exportEnabled}
                exportItems={exportItems}
                defaultExportTypes={defaultExportTypes}
                excludeExportTypes={excludeExportTypes}
                onExport={(type) => {
                  // * export 실행 시 컬럼 표시/숨김 컨텍스트를 함께 전달
                  onExport?.(type, exportContext)
                }}
                onBeforeOpen={() => {
                  // * 다른 오버레이 정리가 필요하면 여기서 처리
                }}
              />
            </Flex>
          ) : null}

          {searchEnabled ? (
            <TableSearch
              disabled={disabled}
              searchEnabled={searchEnabled}
              searchValue={searchValue}
              searchPlaceholder={searchPlaceholder}
              onSearchChange={onSearchChange}
              onBeforeOpen={() => {
                // * 다른 오버레이 정리가 필요하면 여기서 처리
              }}
            />
          ) : null}
        </Flex>
      </Flex>

      {filterEnabled ? (
        <TableFilter
          disabled={disabled}
          filterEnabled={filterEnabled}
          filterActiveCount={filterActiveCount}
          filterOpen={effectiveFilterOpen}
          onFilterOpenChange={setFilterOpenSafe}
          filterDrawerVariant={filterDrawerVariant}
          filterDrawerPlacement={filterDrawerPlacement}
          filterDrawerCloseBehavior={filterDrawerCloseBehavior}
          filterDrawerWidth={filterDrawerWidth}
          filterDrawerHeight={filterDrawerHeight}
          filterSkeletonEnabled={filterSkeletonEnabled}
          filterSkeletonCount={filterSkeletonCount}
          onFilterSearch={onFilterSearch}
          onFilterReset={onFilterReset}
          filterContent={filterContent}
          onBeforeOpen={() => {
            // * Filter를 열기 직전에 다른 UI를 정리해야 하면 여기서 처리
          }}
          hideTrigger
        />
      ) : null}
    </>
  )
}

export default TableToolBar
