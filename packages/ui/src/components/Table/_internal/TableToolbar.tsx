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

  // search
  searchEnabled?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void

  // export
  exportEnabled?: boolean
  exportItems?: ExportItem<ExportType<TExtraExportType>>[]
  defaultExportTypes?: DefaultExportType[]
  excludeExportTypes?: ExportType<TExtraExportType>[]
  onExport?: (type: ExportType<TExtraExportType>, context?: TableExportContext) => void

  // column
  columnVisibilityEnabled?: boolean
  columns?: ColumnVisibilityItem[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  onHiddenColumnKeysChange?: (hiddenKeys: string[], hiddenColumns: ColumnVisibilityItem[]) => void
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number

  // filter
  filterEnabled?: TableFilterProps["filterEnabled"]
  filterActiveCount?: TableFilterProps["filterActiveCount"]
  filterOpen?: TableFilterProps["filterOpen"]
  onFilterOpenChange?: TableFilterProps["onFilterOpenChange"]
  filterDrawerVariant?: TableFilterProps["filterDrawerVariant"]
  filterDrawerPlacement?: TableFilterProps["filterDrawerPlacement"]
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
 * * 테이블 상단 툴바 UI를 제공하는 컴포넌트(컬럼 표시/필터/내보내기/검색)
 * * filterDrawerCloseBehavior 옵션/처리는 프로젝트 규칙에 따라 제거된 버전
 *
 * * 구성 요소
 *   * Title: title이 있을 때 좌측에 타이틀 표시(Typography)
 *   * ColumnVisible: 숨김 컬럼 선택 UI(TableColumnVisible) 렌더
 *   * Filter: 필터 토글 버튼 + 하단 필터 패널(TableFilter, hideTrigger로 트리거 숨김) 렌더
 *   * Export: 내보내기 메뉴(TableExport) 렌더
 *   * Search: 검색 토글 입력(TableSearch) 렌더
 *
 * * filter open 제어
 *   * filterOpen이 undefined면 내부 상태(uncontrolledFilterOpen)로 관리
 *   * filterOpen이 주어지면 controlled로 동작하며 onFilterOpenChange로 위임
 *   * setFilterOpenSafe는 disabled/filterEnabled 조건을 먼저 체크한 뒤 open 상태를 안전하게 갱신
 *
 * * exportContext 계산
 *   * columns 중 hideable !== false 인 컬럼만 대상으로 visible/hidden을 계산
 *   * visibleColumnKeys가 controlled로 주어지면 해당 값을 사용
 *   * 없으면 defaultVisibleColumnKeys → allHideableKeys 순으로 fallback
 *   * onHiddenColumnKeysChange를 통해 들어온 최신 hidden 결과(hiddenColumnKeysState/hiddenColumnsState)가
 *     존재하면 우선 적용하여 컨트롤드/비동기 갱신 타이밍을 보정
 *   * 최종 context(visibleColumnKeys/hiddenColumnKeys/hiddenColumns)를 onExport에 전달
 *
 * * hidden 상태 동기화
 *   * TableColumnVisible에서 onHiddenColumnKeysChange가 호출되면
 *     내부 상태(hiddenColumnKeysState/hiddenColumnsState)를 갱신하고
 *     외부 onHiddenColumnKeysChange도 함께 호출
 *
 * * 레이아웃/스타일
 *   * 상단 툴바는 Flex로 좌우 배치(타이틀 / 우측 액션)
 *   * 배경 흰색, 보더, 라운드, zIndex(tooltip)로 오버레이 대비
 *   * 각 액션 그룹 사이에 Divider(vertical)로 구분선을 제공
 *
 * @module TableToolBar
 * 테이블 툴바(컬럼/필터/내보내기/검색)를 렌더링합니다.
 * - 필터는 TableFilter를 하단에 렌더링하며, 상단 트리거는 hideTrigger로 숨깁니다.
 * - 내보내기 시 현재 컬럼 표시/숨김 상태(exportContext)를 함께 전달할 수 있습니다.
 *
 * @usage
 * <TableToolBar
 *   title="Users"
 *   columns={columns}
 *   onExport={(type, ctx) => export(type, ctx)}
 *   filterContent={<FilterForm />}
 *   onFilterSearch={applyFilter}
 *   onFilterReset={resetFilter}
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
  filterDrawerWidth = 360,
  filterDrawerHeight = 220,
  filterSkeletonEnabled = true,
  filterSkeletonCount = 2,
  onFilterSearch,
  onFilterReset,
  filterContent,
}: TableToolBarProps<TExtraExportType>) => {
  // * filterOpen이 주어지면 controlled 모드로 동작
  const isFilterControlled = filterOpen !== undefined
  const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false)
  const effectiveFilterOpen = isFilterControlled ? Boolean(filterOpen) : uncontrolledFilterOpen

  // * 컬럼 숨김 결과를 export context로 전달하기 위한 내부 상태(최신값 유지)
  const [hiddenColumnKeysState, setHiddenColumnKeysState] = useState<string[]>([])
  const [hiddenColumnsState, setHiddenColumnsState] = useState<ColumnVisibilityItem[]>([])

  // * export에 전달할 컨텍스트(visible/hidden 계산)
  const exportContext = useMemo<TableExportContext>(() => {
    const hideableColumns = (columns ?? []).filter((c) => c.hideable !== false)
    const allHideableKeys = hideableColumns.map((c) => c.key)

    const fallback = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    const effectiveVisibleKeys =
      (visibleColumnKeys !== undefined ? visibleColumnKeys : fallback) ?? []

    const visibleSet = new Set(effectiveVisibleKeys)
    const computedHiddenKeys = allHideableKeys.filter((k) => !visibleSet.has(k))
    const computedHiddenColumns = hideableColumns.filter((c) => computedHiddenKeys.includes(c.key))

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
                setHiddenColumnKeysState(hiddenKeys)
                setHiddenColumnsState(hiddenColumns)
                onHiddenColumnKeysChange?.(hiddenKeys, hiddenColumns)
              }}
              columnsSkeletonEnabled={columnsSkeletonEnabled}
              columnsSkeletonCount={columnsSkeletonCount}
              onBeforeOpen={() => {}}
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
                  onClick={() => setFilterOpenSafe(!effectiveFilterOpen)}
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
                onExport={(type) => onExport?.(type, exportContext)}
                onBeforeOpen={() => {}}
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
              onBeforeOpen={() => {}}
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
