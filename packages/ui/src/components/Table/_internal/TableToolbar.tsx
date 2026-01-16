import { useEffect, useMemo, useRef, useState } from "react"
import Flex from "../../Flex/Flex"
import TextField from "../../TextField/TextField"
import Popper from "../../Popper/Popper"
import IconButton from "../../IconButton/IconButton"
import Menu from "../../Menu/Menu"
import { styled } from "../../../tokens/customStyled"
import { Typography } from "../../Typography/Typography"
import { theme } from "../../../tokens/theme"
import Divider from "../../Divider/Divider"
import CheckBoxGroup from "../../CheckBoxGroup/CheckBoxGroup"
import Skeleton from "../../Skeleton/Skeleton"
import Button from "../../Button/Button"
import Badge from "../../Badge/Badge"
import Drawer, { DrawerCloseBehavior, DrawerVariant } from "../../Drawer/Drawer"
import type { AxisPlacement } from "../../../types"
import Select from "../../Select/Select"
import ScrollBox from "../../ScrollBox/ScrollBox"
import Box from "../../Box/Box"

export type ExportType = "excel" | "csv" | "print"

export type ColumnVisibilityItem = {
  key: string
  title: string
  hideable?: boolean
}

export type FilterOperator = "contains" | "startsWith" | "endsWith" | "equals"

export type FilterItem = {
  id: string
  columnKey?: string
  operator?: FilterOperator
  value?: string
}

export type TableToolbarProps = {
  title?: string
  disabled?: boolean

  // search
  searchEnabled?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void

  // export
  exportEnabled?: boolean
  onExport?: (type: ExportType) => void

  // column visibility
  columnVisibilityEnabled?: boolean
  columns?: ColumnVisibilityItem[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number

  // filter drawer
  filterEnabled?: boolean
  filterDrawerVariant?: DrawerVariant // default: "flex"
  filterDrawerPlacement?: AxisPlacement // default: "top"
  filterDrawerCloseBehavior?: DrawerCloseBehavior // default: "hidden"
  filterDrawerWidth?: number | string // left/right
  filterDrawerHeight?: number | string // top/bottom

  filterValue?: FilterItem[]
  defaultFilterValue?: FilterItem[]
  onFilterChange?: (next: FilterItem[]) => void
  filterSkeletonEnabled?: boolean
  filterSkeletonCount?: number
}

const TableToolbar = ({
  title,
  disabled,

  searchEnabled = true,
  searchValue,
  searchPlaceholder,
  onSearchChange,

  exportEnabled = true,
  onExport,

  columnVisibilityEnabled = true,
  columns = [],
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,
  columnsSkeletonEnabled = true,
  columnsSkeletonCount = 6,

  filterEnabled = true,
  filterDrawerVariant = "flex",
  filterDrawerPlacement = "top",
  filterDrawerCloseBehavior = "hidden",
  filterDrawerWidth = 360,
  filterDrawerHeight = 220,

  filterValue,
  defaultFilterValue,
  onFilterChange,
  filterSkeletonEnabled = true,
  filterSkeletonCount = 2,
}: TableToolbarProps) => {
  const [exportOpen, setExportOpen] = useState(false)
  const exportAnchorRef = useRef<HTMLButtonElement | null>(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsAnchorRef = useRef<HTMLButtonElement | null>(null)

  const [filterOpen, setFilterOpen] = useState(false)

  const canExportOpen = useMemo(
    () => Boolean(exportEnabled && onExport && !disabled),
    [exportEnabled, onExport, disabled],
  )

  const canColumnsOpen = useMemo(
    () => Boolean(columnVisibilityEnabled && !disabled),
    [columnVisibilityEnabled, disabled],
  )

  const isColumnsInteractive = Boolean(onVisibleColumnKeysChange)

  const hideableColumns = useMemo(
    () => (columns ?? []).filter((c) => c.hideable !== false),
    [columns],
  )

  const allHideableKeys = useMemo(() => hideableColumns.map((c) => c.key), [hideableColumns])

  const effectiveVisibleKeys = useMemo(() => {
    const fallback = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    return (visibleColumnKeys?.length ? visibleColumnKeys : fallback) ?? []
  }, [visibleColumnKeys, defaultVisibleColumnKeys, allHideableKeys])

  const shouldShowColumnsSkeleton = useMemo(() => {
    if (!columnVisibilityEnabled) return false
    if (!columnsSkeletonEnabled) return false
    if (disabled) return true
    return !isColumnsInteractive || (columns?.length ?? 0) === 0
  }, [
    columnVisibilityEnabled,
    columnsSkeletonEnabled,
    disabled,
    isColumnsInteractive,
    columns?.length,
  ])

  const setVisibleKeys = (keys: string[]) => {
    onVisibleColumnKeysChange?.(keys)
  }

  const handleResetColumns = () => {
    const reset = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    setVisibleKeys(reset)
  }

  const hiddenCount = useMemo(() => {
    if (!columnVisibilityEnabled) return 0
    if (!allHideableKeys.length) return 0
    const v = new Set(effectiveVisibleKeys)
    let count = 0
    allHideableKeys.forEach((k) => {
      if (!v.has(k)) count += 1
    })
    return count
  }, [columnVisibilityEnabled, allHideableKeys, effectiveVisibleKeys])

  const isFilterInteractive = Boolean(onFilterChange)
  const hasFilterColumns = hideableColumns.length > 0

  const effectiveFilterValue = useMemo(() => {
    if (filterValue && filterValue.length) return filterValue
    if (defaultFilterValue && defaultFilterValue.length) return defaultFilterValue
    return []
  }, [filterValue, defaultFilterValue])

  const shouldShowFilterSkeleton = useMemo(() => {
    if (!filterEnabled) return false
    if (!filterSkeletonEnabled) return false
    if (disabled) return true
    return !isFilterInteractive || !hasFilterColumns
  }, [filterEnabled, filterSkeletonEnabled, disabled, isFilterInteractive, hasFilterColumns])

  const filterActiveCount = useMemo(() => {
    const list = effectiveFilterValue ?? []
    return list.filter((f) => (f.value ?? "").trim().length > 0).length
  }, [effectiveFilterValue])

  useEffect(() => {
    if (!searchOpen || disabled) return
    const id = requestAnimationFrame(() => {
      ;(searchInputRef.current as any)?.focus?.()
    })
    return () => cancelAnimationFrame(id)
  }, [searchOpen, disabled])

  useEffect(() => {
    if (!columnsOpen) return
    if (columnsAnchorRef.current) return
    const id = requestAnimationFrame(() => {
      if (columnsAnchorRef.current) setColumnsOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [columnsOpen])

  const toggleColumns = () => {
    if (!canColumnsOpen) return
    setExportOpen(false)
    setFilterOpen(false)
    setColumnsOpen((v) => !v)
  }

  const toggleExport = () => {
    if (!canExportOpen) return
    setColumnsOpen(false)
    setFilterOpen(false)
    setExportOpen((v) => !v)
  }

  const toggleFilter = () => {
    if (disabled) return
    if (!filterEnabled) return
    setColumnsOpen(false)
    setExportOpen(false)
    setFilterOpen((v) => !v)
  }

  const setFilters = (next: FilterItem[]) => {
    onFilterChange?.(next)
  }

  const handleAddFilter = () => {
    if (disabled) return
    if (!isFilterInteractive) return
    const firstCol = hideableColumns[0]?.key
    const next: FilterItem = {
      id: makeId(),
      columnKey: firstCol,
      operator: "contains",
      value: "",
    }
    setFilters([...(effectiveFilterValue ?? []), next])
  }

  const handleRemoveFilter = (id: string) => {
    if (disabled) return
    if (!isFilterInteractive) return
    setFilters((effectiveFilterValue ?? []).filter((f) => f.id !== id))
  }

  const handleRemoveAllFilters = () => {
    if (disabled) return
    if (!isFilterInteractive) return
    setFilters([])
  }

  const updateFilter = (id: string, patch: Partial<FilterItem>) => {
    if (disabled) return
    if (!isFilterInteractive) return
    setFilters((effectiveFilterValue ?? []).map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const columnSelectOptions = useMemo(
    () => hideableColumns.map((c) => ({ value: c.key, label: c.title })),
    [hideableColumns],
  )

  const operatorOptions = useMemo(
    () => [
      { value: "startsWith", label: "starts with" },
      { value: "contains", label: "contains" },
      { value: "endsWith", label: "ends with" },
      { value: "equals", label: "equals" },
    ],
    [],
  )

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
            <Flex align="center" gap={6}>
              <Badge
                content={hiddenCount > 0 ? hiddenCount : undefined}
                showZero={false}
                status="info"
                placement="top-right"
              >
                <IconButton
                  icon="ViewColumn"
                  disabled={disabled}
                  disableInteraction={false}
                  toolTip="컬럼 표시"
                  onClick={toggleColumns}
                  ref={(node: any) => {
                    columnsAnchorRef.current = node
                  }}
                />
              </Badge>

              {columnsOpen && !!columnsAnchorRef.current && (
                <Popper
                  open
                  anchorRef={columnsAnchorRef as any}
                  placement="bottom-end"
                  offsetY={8}
                  width="max-content"
                >
                  <Flex direction="column">
                    <Flex direction="column" gap={6} p={10} sx={{ minWidth: 280 }}>
                      <Flex direction="column" gap={2} sx={{ maxHeight: 260, overflowY: "auto" }}>
                        {shouldShowColumnsSkeleton ? (
                          <Flex direction="column" gap={10} p={2}>
                            {Array.from({ length: Math.max(3, columnsSkeletonCount) }).map(
                              (_, i) => (
                                <Flex key={`col_skel_${i}`} align="center" gap={10}>
                                  <Skeleton variant="rectangular" width={16} height={16} />
                                  <Skeleton variant="text" width="70%" />
                                </Flex>
                              ),
                            )}
                          </Flex>
                        ) : (
                          <CheckBoxGroup
                            direction="vertical"
                            allCheck
                            allCheckText="전체 보기/숨기기"
                            value={effectiveVisibleKeys}
                            data={hideableColumns.map((c) => ({ text: c.title, value: c.key }))}
                            onChange={(next) => {
                              if (disabled) return
                              setVisibleKeys(next as string[])
                            }}
                            disabled={disabled}
                          />
                        )}
                      </Flex>
                    </Flex>

                    <Divider direction="horizontal" thickness="1px" />

                    <Flex align="center" justify="space-between" p={10}>
                      <Typography
                        variant="b2Regular"
                        text="전체 보기/숨기기"
                        color="text.secondary"
                        sx={{ opacity: 0.6 }}
                      />
                      <Button
                        text="초기화"
                        variant="text"
                        color={"secondary"}
                        disabled={disabled || !isColumnsInteractive || shouldShowColumnsSkeleton}
                        onClick={() => {
                          if (disabled) return
                          if (!isColumnsInteractive) return
                          handleResetColumns()
                        }}
                      />
                    </Flex>
                  </Flex>
                </Popper>
              )}
            </Flex>
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
              <IconButton
                icon="Download"
                disabled={disabled}
                disableInteraction={false}
                toolTip="내보내기"
                onClick={toggleExport}
                ref={(node: any) => {
                  exportAnchorRef.current = node
                }}
              />

              {exportOpen && !!exportAnchorRef.current && (
                <Popper
                  open
                  anchorRef={exportAnchorRef as any}
                  placement="bottom-end"
                  offsetY={8}
                  width="max-content"
                >
                  <Menu
                    text="Excel 다운로드"
                    onClick={() => {
                      if (!canExportOpen) return
                      onExport?.("excel")
                      setExportOpen(false)
                    }}
                  />
                  <Menu
                    text="CSV 다운로드"
                    onClick={() => {
                      if (!canExportOpen) return
                      onExport?.("csv")
                      setExportOpen(false)
                    }}
                  />
                  <Menu
                    text="프린트"
                    onClick={() => {
                      if (!canExportOpen) return
                      onExport?.("print")
                      setExportOpen(false)
                    }}
                  />
                </Popper>
              )}
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
                  setColumnsOpen(false)
                  setExportOpen(false)
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

      {filterEnabled && filterOpen && (
        <Drawer
          open
          onClose={() => setFilterOpen(false)}
          variant={filterDrawerVariant}
          placement={filterDrawerPlacement}
          closeBehavior={filterDrawerCloseBehavior}
          width={filterDrawerWidth}
          height={filterDrawerHeight}
          disableBackdrop={filterDrawerVariant === "flex"}
          sx={{
            borderRadius: theme.borderRadius[4],
            border: `1px solid ${theme.colors.border.default}`,
            backgroundColor: theme.colors.background.default,
          }}
        >
          <Flex width={"100%"} direction="column" p={"10px"}>
            <Flex align="center" justify="space-between" mb={4}>
              <Flex align="center" justify="space-between">
                <IconButton
                  icon="Add"
                  toolTip="필터 추가"
                  disabled={disabled || !isFilterInteractive}
                  onClick={handleAddFilter}
                />

                <IconButton
                  icon="reset"
                  toolTip="초기화"
                  disabled={
                    disabled || !isFilterInteractive || (effectiveFilterValue ?? []).length === 0
                  }
                  onClick={handleRemoveAllFilters}
                />
              </Flex>
              <IconButton
                icon="CloseLine"
                toolTip="닫기"
                disableInteraction={false}
                disabled={disabled}
                onClick={() => setFilterOpen(false)}
              />
            </Flex>
            <Divider mb={10} />

            <ScrollBox maxHeight={"150px"}>
              {shouldShowFilterSkeleton ? (
                <FilterSkeletonBox>
                  {Array.from({ length: Math.max(1, filterSkeletonCount) }).map((_, i) => (
                    <Flex width={"100%"} key={`filter_skel_${i}`} align="center" gap={10}>
                      <Skeleton variant="rectangular" width={160} height={34} />
                      <Skeleton variant="rectangular" width={160} height={34} />
                      <Skeleton variant="rectangular" width={200} height={34} />
                    </Flex>
                  ))}
                  <Flex align="center" justify="space-between" mt={12}>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={120} />
                  </Flex>
                </FilterSkeletonBox>
              ) : (
                <Flex direction="column" gap={10} p={"6px 0 12px 0"}>
                  {(effectiveFilterValue ?? []).map((f, idx) => (
                    <FilterRow key={f.id}>
                      <IconButton
                        icon="CloseLine"
                        toolTip="삭제"
                        disableInteraction={false}
                        disabled={disabled}
                        onClick={() => handleRemoveFilter(f.id)}
                      />

                      {idx > 0 ? (
                        <AndChip>
                          <Typography variant="b2Regular" text="And" />
                        </AndChip>
                      ) : (
                        <AndChip $ghost />
                      )}

                      <FilterSelectWrap>
                        <Typography
                          variant="b2Regular"
                          text="Columns"
                          color="text.secondary"
                          sx={{ opacity: 0.8, marginBottom: 2 }}
                        />
                        <Select
                          options={columnSelectOptions as any}
                          value={(f.columnKey ?? "") as any}
                          onChange={(v: any) => updateFilter(f.id, { columnKey: String(v) })}
                          placeholder="Select"
                          disabled={disabled}
                          size="M"
                          sx={{ width: "100%" }}
                        />
                      </FilterSelectWrap>

                      <FilterSelectWrap>
                        <Typography
                          variant="b2Regular"
                          text="Operator"
                          color="text.secondary"
                          sx={{ opacity: 0.8, marginBottom: 2 }}
                        />
                        <Select
                          options={operatorOptions as any}
                          value={(f.operator ?? "contains") as any}
                          onChange={(v: any) =>
                            updateFilter(f.id, { operator: v as FilterOperator })
                          }
                          placeholder="contains"
                          disabled={disabled}
                          size="M"
                          sx={{ width: "100%" }}
                        />
                      </FilterSelectWrap>

                      <ValueFieldWrap>
                        <Typography
                          variant="b2Regular"
                          text="Value"
                          color="text.secondary"
                          sx={{ opacity: 0.8, marginBottom: 2 }}
                        />
                        <TextField
                          disabled={disabled}
                          value={f.value ?? ""}
                          placeholder="Filter value"
                          onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                        />
                      </ValueFieldWrap>
                    </FilterRow>
                  ))}
                </Flex>
              )}
            </ScrollBox>
          </Flex>
        </Drawer>
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

const FilterBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 0 12px 0;
  background-color: aliceblue;
`

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 34px 90px 1fr 1fr 1.2fr;
  gap: 10px;
  align-items: end;

  @media (max-width: 980px) {
    grid-template-columns: 34px 90px 1fr;
  }
`

const FilterSelectWrap = styled.div`
  min-width: 180px;
`

const AndChip = styled.div<{ $ghost?: boolean }>`
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${({ $ghost }) =>
    $ghost ? "1px solid transparent" : `1px solid ${theme.colors.border.default}`};
  border-radius: ${theme.borderRadius[4]};
  background-color: ${({ $ghost }) => ($ghost ? "transparent" : theme.colors.background.default)};
  padding: 0 10px;
`

const ValueFieldWrap = styled.div`
  min-width: 220px;
`

const FilterSkeletonBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 6px 0 12px 0;
`

const makeId = () => `f_${Math.random().toString(36).slice(2, 10)}`

export default TableToolbar
