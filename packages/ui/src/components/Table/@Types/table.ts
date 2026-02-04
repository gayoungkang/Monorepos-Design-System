import type { ReactNode } from "react"
import type { BaseMixinProps } from "../../../tokens/baseMixin"
import type { AxisPlacement } from "packages/ui/src/types/placement"

// * 테이블 정렬 방향(오름차순/내림차순) 타입
export type SortDirection = "ASC" | "DESC"

// * 테이블 셀의 수평 정렬(left/center/right) 타입
export type TableCellAlign = "left" | "center" | "right"

// * 테이블 동작 모드(이 프로젝트는 server 모드만 사용)
export type TableMode = "server"

// * 서버 정렬 조건(정렬 기준 컬럼 key + 정렬 방향) 타입
export type ServerTableSort = {
  key: string
  direction: SortDirection
}

// * 서버 필터 조건(필터 대상 key + 연산자 + 값) 타입
export type ServerTableFilter = {
  key: string
  operator?: string
  value?: unknown
}

// * 서버 제어형 테이블 쿼리(페이지/사이즈/검색/정렬/필터) 타입
export type ServerTableQuery = {
  page: number // 1-based
  rowsPerPage: number
  keyword: string
  sort?: ServerTableSort
  filters?: ServerTableFilter[]
}

// * 가상 스크롤(virtualization) 옵션(고정 rowHeight 전제) 타입
export type VirtualizedOptions = {
  enabled?: boolean
  rowHeight: number
  overscan?: number
}

// * 테이블 컬럼 정의(표시/렌더/정렬 트리거/비활성) 타입
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

// * 행 단위 액션(버튼/링크 등) 정의(렌더/비활성/클릭) 타입
export type TableRowAction<T extends Record<string, unknown>> = {
  key: string
  render: (row: T, index: number) => ReactNode
  disabled?: boolean | ((row: T) => boolean)
  onClick?: (row: T, index: number) => void
}

// * 요약 행(summary row) 표시 옵션 및 서버 집계 데이터 타입
export type SummaryRowProps<T extends Record<string, unknown>> = {
  enabled?: boolean
  sticky?: boolean
  rows: any[]
  data?: Record<string, number>[]
}

// * 테이블 툴바(검색/내보내기/컬럼 표시/필터) 구성 타입
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
  filterDrawerPlacement?: AxisPlacement
  filterDrawerWidth?: number | string
  filterDrawerHeight?: number | string
  filterSkeletonEnabled?: boolean
  filterSkeletonCount?: number
  onFilterSearch?: () => void
  onFilterReset?: () => void
  filterContent?: ReactNode
}

// * 테이블 컴포넌트 최상위 Props(서버 제어형 query + UI 옵션 + 확장 기능) 타입
export type TableProps<
  T extends Record<string, unknown>,
  TExtraExportType extends string = never,
> = BaseMixinProps & {
  tableKey: string
  columnConfig: ColumnProps<T>[]
  data?: T[]

  // * 운영급: row identity를 강제하기 위한 rowKey 추출 함수 타입
  getRowKey?: (row: T, index: number) => string | number

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
