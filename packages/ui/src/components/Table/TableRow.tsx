import TableTr from "./TableTr"
import TableTd from "./TableTd"
import { JSX } from "react"
import { ColumnProps } from "./@Types/table"
import { renderCell, renderDisabledCell } from "./TableCell"

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

const TableRow = <T extends Record<string, unknown>>({
  tableKey,
  index,
  data,
  columnConfig,
  onRowSelect,
  selected,
  disabled = false,
  onDoubleClick,
}: TableRowProps<T>): JSX.Element => {
  const handleRowClick = () => {
    if (disabled) return
    if (!onRowSelect) return
    const newSelected = !selected
    columnConfig.forEach((column) => {
      column.onClick?.(data, index)
    })
    onRowSelect(data, index, newSelected)
  }

  const isColumnDisabled = (column: ColumnProps<T>): boolean => {
    if (!column.disabled) return false
    return typeof column.disabled === "function"
      ? Boolean(column.disabled(data))
      : Boolean(column.disabled)
  }

  return (
    <TableTr
      selected={!!onRowSelect && !disabled}
      disabled={disabled}
      onClick={onRowSelect && !disabled ? handleRowClick : undefined}
      onDoubleClick={!disabled ? () => onDoubleClick?.(data) : undefined}
      rowData={data}
    >
      {columnConfig.map((column, ci) => {
        const colDisabled = disabled || isColumnDisabled(column)
        const clickable = !colDisabled && !!column.onClick

        return (
          <TableTd
            key={`${tableKey}_tableBodyCell_${index}_${ci}`}
            clickable={clickable}
            onClick={
              clickable
                ? (e) => {
                    e.stopPropagation()
                    column.onClick?.(data, index)
                    if (onRowSelect) onRowSelect(data, index, !selected)
                  }
                : undefined
            }
            align={column.textAlign}
            selected={onRowSelect ? selected : false}
            disabled={colDisabled}
          >
            {colDisabled ? renderDisabledCell(column) : renderCell(column, data, index)}
          </TableTd>
        )
      })}
    </TableTr>
  )
}

export default TableRow
