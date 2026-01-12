import type { CSSProperties, ReactNode, Ref } from "react"
import type React from "react"
import { PaginationType } from "../../Pagination/Pagination"

export type SortDirection = "ASC" | "DESC"

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

export interface TableProps<T> {
  tableKey: string
  tableConfig?: TableConfig
  columnConfig: ColumnProps<T>[]
  data: T[]
  pagination?: PaginationType
  emptyRowText?: string
  sticky?: boolean
  innerRef?: Ref<TableRef>
  renderRow?: (data: T, index?: number) => React.ReactNode
  customTableHeader?: CustomTableHeaderProps[]
}

export interface InfiniteTableProps<T> extends TableProps<T> {
  onDoubleClick?: (row: T, index: number) => void
  onRowSelectChange?: (row: T | null, index: number | null) => void
  renderRow?: (data: T, index?: number) => React.ReactNode
  loadMore: () => void
  loading?: boolean
  hasMore?: boolean
  top?: string
  customTableHeader?: CustomTableHeaderProps[]
  height?: string
  renderTableEmptyRow?: ReactNode
}
