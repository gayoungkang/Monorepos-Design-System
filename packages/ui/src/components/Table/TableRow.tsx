import TableTr from "./TableTr"
import TableTd from "./TableTd"
import { JSX } from "react"
import { ColumnProps } from "./@Types/table"
import { renderCell } from "./TableCell"

type TableRowProps<T extends Record<string, unknown>> = {
  tableKey: string
  index: number
  data: T & { children?: T[] }
  columnConfig: ColumnProps<T>[]
  onRowSelect?: (data: T, index: number, selected: boolean) => void
  onDoubleClick?: (row: T | null) => void
  selected?: boolean
  disabled?: boolean
}
/**---------------------------------------------------------------------------/

* ! TableRow
*
* * 테이블 바디의 단일 행(row)을 렌더링하는 컴포넌트
* * columnConfig 기반으로 각 셀(TableTd)을 생성하고 renderCell로 셀 콘텐츠 렌더링
* * 행 선택(onRowSelect) 기능 지원 (row click 시 selected 토글)
* * 셀 단위 클릭(column.onClick) 지원 (셀 클릭 시 이벤트 전파 차단)
* * disabled 상태 지원 (row/cell 클릭 및 더블클릭 동작 차단)
* * onDoubleClick 제공 시 행 더블클릭 이벤트 전달
*
* * 클릭 처리 우선순위
*   * 행 클릭(handleRowClick): onRowSelect가 있을 때만 동작하며, column.disabled가 아닌 컬럼의 onClick을 선호출
*   * 셀 클릭: column.onClick이 있을 때만 동작하며, row click 전파를 막고 개별 onClick 실행 + 선택 토글 처리
*
* * 셀 상태 계산
*   * column.disabled가 함수면 row data 기반으로 평가, 아니면 boolean으로 처리
*   * row disabled 또는 column disabled면 셀 disabled 처리
*   * column.onClick 존재 + 셀 비활성 아님 -> clickable 스타일/핸들러 적용
*
* @module TableRow
* 테이블 데이터 행을 구성하며, 행 선택/셀 클릭/더블클릭 인터랙션을 함께 처리합니다.
*
* @usage
* <TableRow tableKey="t1" index={0} data={row} columnConfig={cols} />
* <TableRow onRowSelect={...} selected={selected} disabled={false} />

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
}: TableRowProps<T>): JSX.Element => {
  // * row 클릭 시 선택 토글 및 컬럼 onClick을 실행 (rowSelect 사용 시)
  const handleRowClick = () => {
    if (!onRowSelect || disabled) return

    const newSelected = !selected

    columnConfig.forEach((column) => {
      if (!column.disabled) column.onClick?.(data, index)
    })

    onRowSelect(data, index, newSelected)
  }

  return (
    <TableTr
      selected={onRowSelect ? true : false}
      disabled={disabled}
      onClick={onRowSelect && !disabled ? handleRowClick : undefined}
      onDoubleClick={() => (!disabled ? onDoubleClick?.(data) : undefined)}
    >
      {columnConfig.map((column, ci) => {
        // * 컬럼 disabled 조건(function | boolean)을 row 데이터 기준으로 계산
        const columnDisabled =
          typeof column.disabled === "function" ? column.disabled(data) : Boolean(column.disabled)

        // * row disabled + column disabled를 병합
        const isCellDisabled = Boolean(disabled || columnDisabled)

        // * 셀 단위 onClick 활성 조건(핸들러 존재 + disabled 아님)
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
                    if (onRowSelect) onRowSelect(data, index, !selected)
                  }
                : undefined
            }
            align={column.textAlign}
            selected={onRowSelect ? selected : false}
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
