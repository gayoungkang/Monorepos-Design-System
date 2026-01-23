// _internal/TableRow.tsx
import { JSX, memo } from "react"
import TableTr from "./TableTr"
import TableTd from "./TableTd"
import type { ColumnProps, TableRowAction } from "../@Types/table"
import { renderCell } from "./TableCell"
import { normalizeAlign } from "../@utils/table"

type TableRowProps<T extends Record<string, unknown>> = {
  tableKey: string
  index: number
  data: T & { children?: T[] }
  columnConfig: ColumnProps<T>[]
  columns: string
  onRowClick?: (row: T, index: number) => void
  rowActions?: TableRowAction<T>[]
  disabled?: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! TableRow (Memoized / View-only)
 *
 * * 셀 단위 이벤트/핸들러 남발을 제거하고, Row 단위 이벤트만 허용
 * * 컬럼은 render(row) 기반으로만 렌더(입력 컴포넌트 렌더 금지)
 *
/---------------------------------------------------------------------------**/

const TableRowInner = <T extends Record<string, unknown>>({
  tableKey,
  index,
  data,
  columnConfig,
  columns,
  onRowClick,
  rowActions,
  disabled,
}: TableRowProps<T>): JSX.Element => {
  const handleRowClick = () => {
    if (disabled) return
    onRowClick?.(data, index)
  }

  return (
    <TableTr
      columns={columns}
      disabled={disabled}
      rowData={data}
      onClick={onRowClick && !disabled ? (handleRowClick as any) : undefined}
    >
      {columnConfig.map((column, ci) => {
        const columnDisabled =
          typeof column.disabled === "function" ? column.disabled(data) : Boolean(column.disabled)
        const isCellDisabled = Boolean(disabled || columnDisabled)

        return (
          <TableTd
            key={`${tableKey}_tableBodyCell_${index}_${ci}`}
            align={normalizeAlign(column.textAlign)}
            disabled={isCellDisabled}
          >
            {renderCell(column, data, index, isCellDisabled)}
          </TableTd>
        )
      })}

      {(rowActions?.length ?? 0) > 0
        ? rowActions!.map((a, ai) => {
            const actionDisabled =
              typeof a.disabled === "function" ? a.disabled(data) : Boolean(a.disabled)
            const isActionDisabled = Boolean(disabled || actionDisabled)

            return (
              <TableTd
                key={`${tableKey}_rowAction_${index}_${a.key ?? ai}`}
                align="center"
                disabled={isActionDisabled}
                clickable={Boolean(a.onClick) && !isActionDisabled}
                onClick={
                  a.onClick && !isActionDisabled
                    ? (e) => {
                        e.stopPropagation()
                        a.onClick?.(data, index)
                      }
                    : undefined
                }
              >
                {a.render(data, index)}
              </TableTd>
            )
          })
        : null}
    </TableTr>
  )
}

const TableRow = memo(TableRowInner, (prev, next) => {
  return (
    prev.tableKey === next.tableKey &&
    prev.index === next.index &&
    prev.data === next.data &&
    prev.columns === next.columns &&
    prev.columnConfig === next.columnConfig &&
    prev.onRowClick === next.onRowClick &&
    prev.rowActions === next.rowActions &&
    prev.disabled === next.disabled
  )
}) as typeof TableRowInner

export default TableRow
