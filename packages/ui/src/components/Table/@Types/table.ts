import type { CSSProperties, ReactNode, Ref } from "react"
import type React from "react"
import { PaginationType } from "../../Pagination/Pagination"
import { BaseMixinProps } from "packages/ui/src/tokens/baseMixin"
import { SummaryRowProps } from "../_internal/TableSummaryRow"
import { ExportType } from "../_internal/TableExport"

export type SortDirection = "ASC" | "DESC"
export type TableCellAlign = "left" | "center" | "right"
export type TableMode = "client" | "server"
export type ExportScope = "page" | "all"

export const CellType = {
  Default: "Default",
  TextField: "TextField",
  Button: "Button",
  CheckBox: "CheckBox",
  IconButton: "IconButton",
  Accordion: "Accordion",
} as const

export type CellTypeKey = keyof typeof CellType

export type CustomTableHeaderProps = {
  title: string
  colspan: number
  rowspan?: number
  align?: "left" | "center" | "right"
}

export type SelectChangeEvent<T = number> = React.ChangeEvent<HTMLSelectElement> & {
  target: EventTarget & { value: T }
}

export type ColumnOnChangeType<T> = {
  type: keyof typeof CellType
  rowIndex: number
  key: keyof T
  changeValue: string | boolean
}

export type ColumnProps<T> = {
  key: keyof T | "custom"
  title: string
  type?: keyof typeof CellType
  width?: string
  textAlign?: CSSProperties["textAlign"]
  onClick?: (data: T, index: number) => void
  renderCellTitle?: string
  onChange?: (data: ColumnOnChangeType<T>) => void
  renderCustomCell?: (data: T) => React.ReactNode
  sort?: boolean
  sortDirection?: SortDirection
  onSortChange?: (key: keyof T, direction: SortDirection) => void
  disabled?: boolean | ((data: T) => boolean)
  renderAccordionSummary?: (row: T) => ReactNode
  renderAccordionDetails?: (row: T) => ReactNode
  accordionDefaultExpanded?: boolean
}

export type TableConfig = {
  totalCount?: number
  rowsPerPageOptions?: number[]
  rowsPerPage?: number
  page?: number
  handleOnRowsPerPageChange?: (event: SelectChangeEvent<number>) => void
}

export type TableRef = {
  insertRow: () => void
  saveData: () => void
}

export type TableQuery = {
  page: number
  rowsPerPage: number
  keyword: string
  sortKey?: string
  sortDirection?: SortDirection
}

export type TableCommon<T> = BaseMixinProps & {
  tableKey: string
  data: T[]
  columnConfig: ColumnProps<T>[]
  renderRow?: (data: T, index?: number) => React.ReactNode
  customTableHeader?: CustomTableHeaderProps[]
  innerRef?: Ref<TableRef>
  tableConfig?: TableConfig
  height?: number | string
  emptyRowText?: string
  sticky?: boolean
  disabled?: boolean
  totalRows?: boolean

  // summary
  summaryRow?: SummaryRowProps<T>

  // mode
  mode?: TableMode

  // search
  searchEnabled?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  keyword?: string
  onKeywordChange?: (keyword: string) => void

  // server mode hook
  onQueryChange?: (query: TableQuery) => void

  // export
  exportEnabled?: boolean
  exportScope?: ExportScope
  onExport?: (type: ExportType, payload: { scope: ExportScope; keyword: string }) => void
}

export type TableProps<T> = TableCommon<T> & {
  rowsPer?: boolean
  pagination?: PaginationType
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
}

export interface InfiniteTableProps<T> extends TableProps<T> {
  loadMore: () => void
  loading?: boolean
  hasMore?: boolean
  top?: string
}
