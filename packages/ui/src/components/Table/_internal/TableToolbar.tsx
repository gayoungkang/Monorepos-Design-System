import { ReactNode, useState } from "react"
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

  // export
  exportEnabled?: boolean
  exportItems?: { type: any; label: string; icon?: string }[]
  excludeExportTypes?: any[]
  onExport?: (type: any, ctx: unknown) => void
  exportContext?: unknown

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
}

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

  exportContext,
}: TableToolBarProps<TExtraExportType>) => {
  const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false)
  const isFilterControlled = typeof filterOpen === "boolean"
  const effectiveFilterOpen = isFilterControlled ? (filterOpen as boolean) : uncontrolledFilterOpen

  const setFilterOpenSafe = (next: boolean) => {
    if (disabled) return
    if (!filterEnabled) return

    if (isFilterControlled) {
      onFilterOpenChange?.(next)
      return
    }

    setUncontrolledFilterOpen(next)
  }

  // * 서버 export job만 허용: onExport 없으면 숨김
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
              onHiddenColumnKeysChange={onHiddenColumnKeysChange}
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

          {canExport ? (
            <Flex align="center" gap={6}>
              <Divider direction="vertical" height={17} thickness="1px" />
              <TableExport<TExtraExportType>
                disabled={disabled}
                exportEnabled={exportEnabled}
                exportItems={exportItems}
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
