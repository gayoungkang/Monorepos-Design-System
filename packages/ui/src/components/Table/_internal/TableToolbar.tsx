import { useEffect, useRef, useState } from "react"
import Flex from "../../Flex/Flex"
import TextField from "../../TextField/TextField"
import IconButton from "../../IconButton/IconButton"
import { styled } from "../../../tokens/customStyled"
import { Typography } from "../../Typography/Typography"
import { theme } from "../../../tokens/theme"
import Divider from "../../Divider/Divider"
import TableExport, { DefaultExportType, ExportItem, ExportType } from "./TableExport"
import TableColumnVisible, { ColumnVisibilityItem } from "./TableColumnVisible"
import TableFilter from "./TableFilter"
import type { TableFilterProps } from "./TableFilter"
import Badge from "../../Badge/Badge"

export type TableToolbarProps<TExtraExportType extends string = never> = {
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
  onExport?: (type: ExportType<TExtraExportType>) => void

  // column visibility
  columnVisibilityEnabled?: boolean
  columns?: ColumnVisibilityItem[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number

  // filter (TableFilter로 위임)
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

const TableToolbar = <TExtraExportType extends string = never>({
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
}: TableToolbarProps<TExtraExportType>) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const isFilterControlled = filterOpen !== undefined
  const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false)
  const effectiveFilterOpen = isFilterControlled ? Boolean(filterOpen) : uncontrolledFilterOpen

  const setFilterOpenSafe = (next: boolean) => {
    if (disabled) return
    if (!filterEnabled) return

    if (isFilterControlled) {
      onFilterOpenChange?.(next)
      return
    }

    setUncontrolledFilterOpen(next)
  }

  const toggleFilter = () => {
    if (disabled) return
    if (!filterEnabled) return
    setFilterOpenSafe(!effectiveFilterOpen)
  }

  useEffect(() => {
    if (!searchOpen || disabled) return
    const id = requestAnimationFrame(() => {
      ;(searchInputRef.current as any)?.focus?.()
    })
    return () => cancelAnimationFrame(id)
  }, [searchOpen, disabled])

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
        <Typography variant="b1Bold" text={title ?? ""} />

        <Flex align="center" justify="flex-end" gap={6} sx={{ minWidth: 0, flex: 1 }}>
          {columnVisibilityEnabled && (
            <TableColumnVisible
              disabled={disabled}
              columnVisibilityEnabled={columnVisibilityEnabled}
              columns={columns}
              visibleColumnKeys={visibleColumnKeys}
              defaultVisibleColumnKeys={defaultVisibleColumnKeys}
              onVisibleColumnKeysChange={onVisibleColumnKeysChange}
              columnsSkeletonEnabled={columnsSkeletonEnabled}
              columnsSkeletonCount={columnsSkeletonCount}
              onBeforeOpen={() => {
                setFilterOpenSafe(false)
              }}
            />
          )}

          {filterEnabled && (
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

          {exportEnabled && (
            <Flex align="center" gap={6}>
              <Divider direction="vertical" height={17} thickness="1px" />
              <TableExport<TExtraExportType>
                disabled={disabled}
                exportEnabled={exportEnabled}
                exportItems={exportItems}
                defaultExportTypes={defaultExportTypes}
                excludeExportTypes={excludeExportTypes}
                onExport={onExport}
                onBeforeOpen={() => {
                  setFilterOpenSafe(false)
                }}
              />
            </Flex>
          )}

          {searchEnabled && (
            <>
              <Divider direction="vertical" height={17} thickness="1px" />
              <IconButton
                icon="SearchLine"
                disabled={disabled}
                disableInteraction={false}
                toolTip="검색"
                onClick={() => {
                  if (disabled) return
                  setFilterOpenSafe(false)
                  setSearchOpen((v) => !v)
                }}
              />
              <SearchSlot $open={searchOpen}>
                <SearchInner $open={searchOpen}>
                  <TextField
                    ref={searchInputRef as any}
                    autoFocus={searchOpen}
                    disabled={disabled}
                    value={searchValue ?? ""}
                    placeholder={searchPlaceholder ?? "검색"}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    sx={{ width: 280 }}
                  />
                </SearchInner>
              </SearchSlot>
            </>
          )}
        </Flex>
      </Flex>

      {/* ✅ 필터 패널은 툴바 "밖"에서 렌더링 */}
      {filterEnabled && (
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
            // * toolbar 내부의 다른 UI(컬럼/익스포트/검색 등) 정리 필요 시 여기에 연결
          }}
          hideTrigger
        />
      )}
    </>
  )
}

const SearchSlot = styled.div<{ $open: boolean }>`
  width: ${({ $open }) => ($open ? "280px" : "0px")};
  overflow: hidden;
  transition: width 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
  will-change: width;
`

const SearchInner = styled.div<{ $open: boolean }>`
  transform-origin: left center;
  transform: ${({ $open }) => ($open ? "scaleX(1)" : "scaleX(0.92)")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition:
    transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 140ms ease;
  will-change: transform, opacity;
`

export default TableToolbar
