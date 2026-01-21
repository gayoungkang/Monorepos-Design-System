import TableTr from "./TableTr"
import TableTd from "./TableTd"
import { JSX } from "react"
import { ColumnProps } from "../@Types/table"
import { renderCell } from "./TableCell"
import { normalizeAlign } from "../@utils/table"

type TableRowProps<T extends Record<string, unknown>> = {
  tableKey: string
  index: number
  data: T & { children?: T[] }
  columnConfig: ColumnProps<T>[]
  columns: string
  onRowSelect?: (data: T, index: number, selected: boolean) => void
  onDoubleClick?: (row: T | null) => void
  selected?: boolean
  disabled?: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! TableRow
 *
 * * Grid 기반 테이블의 단일 행(Row) 렌더링 컴포넌트
 * * TableTr(그리드 컨테이너) 내부에 컬럼 개수만큼 TableTd(셀)를 생성
 * * tableKey/index를 이용해 셀 key를 안정적으로 구성
 *
 * * 행 선택(Row Select) 처리
 *   * onRowSelect가 존재하고 disabled가 아닐 때 행 클릭으로 선택 토글
 *   * handleRowClick: onRowSelect(data, index, !selected) 호출
 *   * TableTr.selected는 "선택 기능 사용 여부"만 표현(Boolean(onRowSelect))
 *   * 각 TableTd.selected는 "현재 선택 상태"를 표현(selected)
 *
 * * 셀 비활성/클릭 가능 여부 계산
 *   * column.disabled가 함수면 row data 기반으로 평가, 아니면 Boolean 처리
 *   * isCellDisabled = disabled || columnDisabled
 *   * isClickable = column.onClick 존재 && !isCellDisabled
 *   * 셀 클릭은 stopPropagation으로 행 클릭(선택 토글)과 분리
 *
 * * 정렬(align) 보정
 *   * column.textAlign 값을 normalizeAlign로 정규화하여 TableTd align에 전달
 *
 * * 셀 렌더링 위임
 *   * renderCell(column, data, index, isCellDisabled)로 셀 콘텐츠 렌더를 위임
 *   * column type / custom renderer / disabled cell 처리 등은 TableCell 로직을 따른다
 *
 * @module TableRow
 * Grid 테이블의 한 행을 렌더링합니다.
 * - 행 선택(onRowSelect)과 셀 클릭(column.onClick)을 분리하여 동작합니다.
 * - 컬럼 설정(columnConfig)을 기반으로 각 셀 렌더링을 TableCell에 위임합니다.
 *
 * @usage
 * <TableRow
 *   tableKey="users"
 *   index={i}
 *   data={row}
 *   columnConfig={columns}
 *   columns={gridColumns}
 *   selected={selected}
 *   onRowSelect={(row, i, s) => setSelectedMap(...)}
 * />
 *
/---------------------------------------------------------------------------**/

const TableRow = <T extends Record<string, unknown>>({
  tableKey,
  index,
  data,
  columnConfig,
  onRowSelect,
  selected,
  disabled,
  onDoubleClick,
  columns,
}: TableRowProps<T>): JSX.Element => {
  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onRowSelect || disabled) return
    onRowSelect(data, index, !Boolean(selected))
  }

  return (
    <TableTr
      columns={columns}
      selected={Boolean(onRowSelect)}
      disabled={disabled}
      rowData={data}
      onClick={onRowSelect && !disabled ? handleRowClick : undefined}
      onDoubleClick={onDoubleClick}
    >
      {columnConfig.map((column, ci) => {
        const columnDisabled =
          typeof column.disabled === "function" ? column.disabled(data) : Boolean(column.disabled)
        const isCellDisabled = Boolean(disabled || columnDisabled)
        const isClickable = Boolean(column.onClick) && !isCellDisabled

        return (
          <TableTd
            key={`${tableKey}_tableBodyCell_${index}_${ci}`}
            clickable={isClickable}
            onClick={
              isClickable
                ? (e) => {
                    e.stopPropagation()
                    column.onClick?.(data, index)
                  }
                : undefined
            }
            align={normalizeAlign(column.textAlign)}
            selected={Boolean(onRowSelect) ? Boolean(selected) : false}
            disabled={isCellDisabled}
          >
            {renderCell(column, data, index, isCellDisabled)}
          </TableTd>
        )
      })}
    </TableTr>
  )
}

export default TableRow
