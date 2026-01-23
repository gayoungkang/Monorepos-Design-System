// @Types/table.ts
import type { ReactNode } from "react"
import type { BaseMixinProps } from "../../../tokens/baseMixin"
import type { AxisPlacement } from "../../../types"

export type SortDirection = "ASC" | "DESC"
export type TableCellAlign = "left" | "center" | "right"

export type TableMode = "server"

export type ServerTableSort = {
  key: string
  direction: SortDirection
}

export type ServerTableFilter = {
  key: string
  operator?: string
  value?: unknown
}

export type ServerTableQuery = {
  page: number // 1-based
  rowsPerPage: number
  keyword: string
  sort?: ServerTableSort
  filters?: ServerTableFilter[]
}

export type VirtualizedOptions = {
  enabled?: boolean
  rowHeight: number
  overscan?: number
}

export type ColumnProps<T extends Record<string, unknown>> = {
  key: keyof T
  title: ReactNode
  width?: number | string
  textAlign?: TableCellAlign | "start" | "end"

  disabled?: boolean | ((row: T) => boolean)

  // server-sort only (UI trigger only)
  sort?: boolean
  sortDirection?: SortDirection
  onSortChange?: (key: keyof T, direction: SortDirection) => void

  // view-only (no inputs)
  render?: (row: T, index: number, ctx: { disabled: boolean }) => ReactNode
}

export type TableRowAction<T extends Record<string, unknown>> = {
  key: string
  render: (row: T, index: number) => ReactNode
  disabled?: boolean | ((row: T) => boolean)
  onClick?: (row: T, index: number) => void
}

export type SummaryRowProps<T extends Record<string, unknown>> = {
  enabled?: boolean
  sticky?: boolean
  rows: any[]
  data?: Record<string, number>[]
}

export type TableToolbarProps<TExtraExportType extends string = never> = {
  title?: string

  searchEnabled?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void

  exportEnabled?: boolean
  exportItems?: { type: any; label: string; icon?: string }[]
  excludeExportTypes?: any[]
  onExport?: (type: any, ctx: unknown) => void
  exportContext?: unknown

  columnVisibilityEnabled?: boolean
  columns?: { key: string; title: string; hideable?: boolean }[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  onHiddenColumnKeysChange?: (hiddenKeys: string[], hiddenColumns: any[]) => void
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number

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

export type TableProps<
  T extends Record<string, unknown>,
  TExtraExportType extends string = never,
> = BaseMixinProps & {
  tableKey: string
  columnConfig: ColumnProps<T>[]
  data?: T[]

  // server-controlled (single source of truth)
  query: ServerTableQuery
  totalCount: number
  rowsPerPageOptions?: number[]
  onQueryChange: (next: ServerTableQuery) => void

  // view-only: row events only
  onRowClick?: (row: T, index: number) => void
  rowActions?: TableRowAction<T>[]

  // pagination UI
  pagination?: "Table" | "Basic"

  // layout
  sticky?: boolean
  height?: number
  emptyRowText?: string
  disabled?: boolean

  // bottom panel toggles
  totalRows?: boolean
  rowsPer?: boolean

  // summary (server-only data)
  summaryRow?: SummaryRowProps<T>

  // toolbar
  toolbar?: TableToolbarProps<TExtraExportType>

  // export (server job only)
  exportEnabled?: boolean
  exportItems?: any[]
  excludeExportTypes?: any[]
  onExport?: (type: any, ctx: unknown) => void
  exportContext?: unknown

  // virtualization
  virtualized?: VirtualizedOptions

  // custom header row render
  customTableHeader?: ReactNode
}
