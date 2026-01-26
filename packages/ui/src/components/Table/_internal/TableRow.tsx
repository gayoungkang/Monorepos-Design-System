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
  rowHeight?: number
  onRowClick?: (row: T, index: number) => void
  rowActions?: TableRowAction<T>[]
  disabled?: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! TableRow
 *
 * * 테이블 본문에서 단일 행(Row)을 렌더링하는 컴포넌트
 * * TableTr(행 컨테이너) + TableTd(셀) 조합으로 구성
 * * columnConfig 기반으로 각 컬럼 셀을 순회 렌더링하며, renderCell 유틸로 셀 콘텐츠를 결정
 * * rowActions가 존재하면, 컬럼 셀 뒤에 액션 셀들을 추가로 렌더링
 *
 * * 클릭/비활성 처리
 *   * disabled=true 인 경우
 *     * 행 클릭(onRowClick) 및 액션 클릭(onClick) 모두 차단
 *   * 행 클릭
 *     * onRowClick가 존재하고 disabled가 아니면 TableTr onClick에 바인딩
 *     * 클릭 시 onRowClick(row, index) 호출
 *   * 액션 클릭
 *     * 액션별 disabled 조건을 평가(function | boolean)
 *     * 활성 상태에서만 clickable/onClick 적용
 *     * 클릭 시 e.stopPropagation()으로 행 클릭 전파를 차단하고 a.onClick(row, index) 호출
 *
 * * 셀 비활성 계산
 *   * 각 column.disabled가 function 이면 (row)로 평가, 아니면 boolean 캐스팅
 *   * disabled(행) || columnDisabled(컬럼) → isCellDisabled
 *
 * * 정렬(align) 처리
 *   * 컬럼 textAlign 값은 normalizeAlign으로 정규화하여 TableTd align에 전달
 *
 * * 메모이제이션
 *   * React.memo + 커스텀 비교 함수로 불필요한 리렌더를 최소화
 *   * 비교 기준: tableKey/index/data(columns 포함) 등 참조 동일성(===) 중심
 *   * 상위에서 data/columnConfig/rowActions를 안정 참조로 유지할수록 효과적
 *
 * @module TableRow
 * 테이블 한 행을 렌더링하며, 컬럼 셀 + 행 액션 셀을 지원하고 memo 비교로 리렌더를 최적화합니다.
 *
 * @usage
 * <TableRow
 *   tableKey="users"
 *   index={i}
 *   data={row}
 *   columnConfig={columns}
 *   columns={gridColumns}
 *   rowHeight={44}
 *   onRowClick={(r, idx) => openDetail(r)}
 *   rowActions={[
 *     { key: "edit", render: (r) => <EditIcon />, onClick: (r) => edit(r) },
 *   ]}
 * />
 *
/---------------------------------------------------------------------------**/

const TableRowInner = <T extends Record<string, unknown>>({
  tableKey,
  index,
  data,
  columnConfig,
  columns,
  rowHeight,
  onRowClick,
  rowActions,
  disabled,
}: TableRowProps<T>): JSX.Element => {
  // * 행 클릭 시 외부 콜백 호출 (disabled 가드 포함)
  const handleRowClick = () => {
    if (disabled) return
    onRowClick?.(data, index)
  }

  return (
    <TableTr
      columns={columns}
      disabled={disabled}
      rowData={data}
      rowHeight={rowHeight}
      onClick={onRowClick && !disabled ? (handleRowClick as any) : undefined}
    >
      {columnConfig.map((column, ci) => {
        // * 컬럼 단위 disabled 계산 (row + column 조건 병합)
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
            // * row action 단위 disabled 계산
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

// * 대규모 테이블 성능을 위한 memo 최적화 (row 단위 참조 비교)
const TableRow = memo(TableRowInner, (prev, next) => {
  return (
    prev.tableKey === next.tableKey &&
    prev.index === next.index &&
    prev.data === next.data &&
    prev.columns === next.columns &&
    prev.rowHeight === next.rowHeight &&
    prev.columnConfig === next.columnConfig &&
    prev.onRowClick === next.onRowClick &&
    prev.rowActions === next.rowActions &&
    prev.disabled === next.disabled
  )
}) as typeof TableRowInner

export default TableRow
