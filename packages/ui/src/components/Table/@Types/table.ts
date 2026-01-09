import type { CSSProperties, ReactNode, Ref } from "react"
import type React from "react"
import IconButton from "../../IconButton/IconButton"
import Accordion from "../../Accordion/Accordion"
import { PaginationType } from "../../Pagination/Pagination"

// * 한 번에 보여줄 페이지 수 (페이지네이션)
export const VISIBLE_PAGES = 10

// * 정렬 방향 타입 정의 ('ASC': 오름차순, 'DESC': 내림차순)
export type SortDirection = "ASC" | "DESC"

// * 셀 타입 정의
export const CellType = {
  Default: "Default",
  TextField: "TextField",
  Button: "Button",
  CheckBox: "CheckBox",
  IconButton: "IconButton",
} as const

// * 셀 타입의 키 타입
export type CellTypeKey = keyof typeof CellType

// * 커스텀 테이블 헤더 props (헤더 병합 시 사용)
export type CustomTableHeaderProps = {
  /** 헤더 제목 */
  title: string
  /** 병합할 열 수 */
  colspan: number
  /** 병합할 행 수 (선택) */
  rowspan?: number
  /** 정렬 방향 */
  align?: "left" | "center" | "right"
}

// * <select> 요소의 변경 이벤트 타입 (value 타입이 제네릭임)
export type SelectChangeEvent<T = number> = React.ChangeEvent<HTMLSelectElement> & {
  target: EventTarget & { value: T }
}

// * 셀 값 변경 시 콜백에 사용되는 타입
export type ColumnOnChangeType<T> = {
  /** 셀 타입 */
  type: keyof typeof CellType
  /** 변경된 셀의 행 인덱스 */
  rowIndex: number
  /** 변경된 데이터의 키 */
  key: keyof T
  /** 변경된 값 */
  changeValue: string | boolean
}

// * 테이블의 컬럼 설정
export type ColumnProps<T> = {
  /** 컬럼 고유 키 or 커스텀 셀 */
  key: keyof T | "custom"
  /** 컬럼 제목 */
  title: string
  /** 셀 타입 */
  type?: keyof typeof CellType
  /** 셀 너비 (CSS string) */
  width?: string
  /** 텍스트 정렬 방식 */
  textAlign?: CSSProperties["textAlign"]
  /** 셀 클릭 이벤트 */
  onClick?: (data: T, index: number) => void
  /** 셀 제목 커스터마이징 */
  renderCellTitle?: string
  /** 셀 값 변경 이벤트 */
  onChange?: (data: ColumnOnChangeType<T>) => void
  /** 커스텀 셀 렌더링 */
  renderCustomCell?: (data: T) => React.ReactNode
  /** 정렬 가능 여부 */
  sort?: boolean
  /** 정렬 방향 */
  sortDirection?: SortDirection
  /** 정렬 변경 핸들러 */
  onSortChange?: (key: keyof T, direction: SortDirection) => void
  /** 셀 비활성화 여부 */
  disabled?: boolean | ((data: T) => boolean)
}

// * 테이블 전역 설정
export type TableConfig = {
  /** 전체 데이터 개수 */
  totalCount?: number
  /** 페이지당 행 수 옵션 */
  rowsPerPageOptions?: number[]
  /** 현재 페이지당 행 수 */
  rowsPerPage?: number
  /** 현재 페이지 */
  page?: number
  /** 행 수 변경 핸들러  */
  handleOnRowsPerPageChange?: (event: SelectChangeEvent<number>) => void
}

// * 외부에서 참조할 수 있는 테이블 메서드
export type TableRef = {
  /** 새 행 삽입  */
  insertRow: () => void
  /** 데이터 저장  */
  saveData: () => void
}

// * 테이블 컴포넌트의 props 정의
export interface TableProps<T> {
  /** 테이블 고유 키  */
  tableKey: string
  /**  테이블 설정  */
  tableConfig?: TableConfig
  /** 컬럼 설정  */
  columnConfig: ColumnProps<T>[]
  /** 테이블 데이터  */
  data: T[]
  /**  페이지네이션  */
  pagination?: PaginationType
  /**  빈 행일 때 표시할 텍스트  */
  emptyRowText?: string
  /** 헤더 고정 여부  */
  sticky?: boolean
  /** 헤더 위치 값  */
  top?: string | number
  /** 헤더 고정 여부  */
  height?: string | number
  /**  테이블 Ref  */
  innerRef?: Ref<TableRef>
  /**  커스텀 행 렌더링  */
  renderRow?: (data: T, index?: number) => React.ReactNode
  /**   셀 병합용 헤더  */
  customTableHeader?: CustomTableHeaderProps[]
  /**   페이지 변경  */
  onPageChange?: (page: number) => void
  /**   페이지당 행 수 변경  */
  onRowsPerPageChange?: (rowsPerPage: number) => void
}

// * 무한 스크롤 테이블용 props
export interface InfiniteTableProps<T> extends TableProps<T> {
  /** 행 더블클릭 이벤트 */
  onDoubleClick?: (row: T, index: number) => void
  /** 행 선택 변경 이벤트 */
  onRowSelectChange?: (row: T | null, index: number | null) => void
  /** 커스텀 행 렌더링 */
  renderRow?: (data: T, index?: number) => React.ReactNode
  /** 스크롤 하단 도달 시 데이터 로드 함수 */
  loadMore: () => void
  /** 로딩 중 여부 */
  loading?: boolean
  /** 더 불러올 데이터 여부 */
  hasMore?: boolean
  /** 테이블 상단 위치 설정 */
  top?: string
  /** 커스텀 헤더 설정 */
  customTableHeader?: CustomTableHeaderProps[]
  /**  테이블 높이 설정 */
  height?: string
  /**  빈 행일 때 커스텀 렌더링  */
  renderTableEmptyRow?: ReactNode
}
