import { useMemo } from "react"
import type { ColumnProps } from "../@Types/table"
import TableTr from "./TableTr"
import TableTd from "./TableTd"
import { buildSums, normalizeAlign } from "../@utils/table"
import { Typography } from "../../Typography/Typography"
import { theme } from "../../../tokens/theme"

import type { ReactNode } from "react"

export type SummaryItem<T> = {
  key: keyof T
  label?: string
  formatter?: (value: number) => string
}

export type SummaryRowLine<T> = {
  items: SummaryItem<T>[]
  label?: string
  labelColumnKey?: keyof T
  labelCell?: ReactNode
}

export type SummaryRowProps<T> = {
  enabled?: boolean
  sticky?: boolean
  rows: SummaryRowLine<T>[]
}

type Props<T> = {
  tableKey: string
  columns: ColumnProps<T>[]
  rows: T[]
  config: SummaryRowProps<T>
  disabled?: boolean
  gridColumns: string
}
/**---------------------------------------------------------------------------/

* ! TableSummaryRow
*
* * 테이블 하단 합계/요약 정보를 렌더링하는 SummaryRow 컴포넌트
* * SummaryRowProps(config) 기반으로 다중 라인(rows) 요약 행을 지원
* * rows 데이터와 SummaryItem 정의를 기반으로 컬럼별 합계(buildSums) 계산
* * 합계 계산 결과는 useMemo로 캐싱하여 rows/config 변경 시에만 재계산
* * label 셀은 지정된 labelColumnKey 또는 기본 첫 번째 컬럼에 렌더링
* * labelCell이 있으면 그대로 렌더링, 없으면 label 또는 기본 "SUM" 텍스트 출력
* * 각 summary item은 formatter가 있으면 포맷 적용, 없으면 Intl.NumberFormat 기본 포맷 적용
* * 그 외 컬럼은 빈 셀(TableTd)로 패딩 처리하여 컬럼 정렬 유지
*
* * Sticky Bottom
*   * config.sticky !== false 인 경우 하단 고정(stickyBottom) 동작 활성화
*   * 여러 요약 라인이 있을 때 겹치지 않도록 line index 기준 bottom offset 계산
*   * rowHeight(고정 값) * (total - 1 - li) 로 각 라인의 누적 오프셋 적용
*
* * Grid 연동
*   * columns(gridTemplateColumns) 값을 TableTr로 전달하여 요약 행도 동일한 그리드 컬럼 폭 유지
*
* * disabled 상태 지원
*   * disabled 전달 시 요약 행 전체 셀 비활성 스타일/동작 적용
*
* @module TableSummaryRow
* 테이블 하단에 합계/요약 행을 표시하는 컴포넌트입니다.
* - 여러 줄 요약(config.rows)을 지원하며, 각 줄은 items 목록으로 합계 대상 컬럼을 정의합니다.
* - sticky 옵션을 통해 요약 행을 테이블 하단에 고정할 수 있습니다.
*
* @usage
* <TableSummaryRow tableKey="t1" columns={cols} rows={rows} config={summaryConfig} gridColumns={columns} />

/---------------------------------------------------------------------------**/

const TableSummaryRow = <T extends Record<string, unknown>>({
  tableKey,
  columns,
  rows,
  config,
  disabled,
  gridColumns,
}: Props<T>) => {
  // * sticky 옵션 기본값: true (config.sticky === false 일 때만 비활성)
  const stickyEnabled = config.sticky !== false
  const total = config.rows.length
  const rowHeight = 32

  // * summary 라인별 합계 맵을 미리 계산
  const sumMaps = useMemo(() => {
    return config.rows.map((line) => buildSums(rows, line.items))
  }, [rows, config.rows])

  // * summary 비활성 시 렌더링 중단
  if (!config.enabled) return null

  return (
    <>
      {config.rows.map((line, li) => {
        const sums = sumMaps[li] ?? {}

        // * stickyBottom 시 라인 순서에 따른 bottom offset 계산(아래에서부터 쌓이도록)
        const bottomOffset = stickyEnabled ? rowHeight * (total - 1 - li) : 0

        return (
          <TableTr
            key={`${tableKey}_sum_row_${li}`}
            columns={gridColumns}
            disabled={disabled}
            stickyBottom={stickyEnabled}
            stickyBottomOffset={bottomOffset}
          >
            {columns.map((col, ci) => {
              const colKey = col.key as keyof T

              // * 라벨 셀로 사용할 컬럼 결정 (labelColumnKey 우선, 없으면 첫 컬럼)
              const isLabelCol =
                (line.labelColumnKey !== undefined && colKey === line.labelColumnKey) ||
                (line.labelColumnKey === undefined && ci === 0)

              if (isLabelCol) {
                return (
                  <TableTd
                    key={`${tableKey}_sum_label_${li}_${ci}`}
                    disabled={disabled}
                    align={normalizeAlign((col as any).textAlign)}
                    sx={{ borderRight: "none" }}
                  >
                    {line.labelCell !== undefined ? (
                      line.labelCell
                    ) : (
                      <Typography variant="b1Bold" text={line.label ?? "SUM"} />
                    )}
                  </TableTd>
                )
              }

              // * summary 대상 컬럼인 경우 합계 텍스트를 formatter/기본 포맷으로 표시
              const item = line.items.find((it) => it.key === colKey)
              if (item) {
                const raw = sums[String(colKey)] ?? 0
                const text = item.formatter
                  ? item.formatter(raw)
                  : new Intl.NumberFormat().format(raw)

                // * summary 대상 컬럼의 기본 정렬은 right (col.textAlign이 있으면 우선 적용)
                const summaryAlign = normalizeAlign((col as any).textAlign) ?? "right"

                return (
                  <TableTd
                    key={`${tableKey}_sum_${String(colKey)}_${li}_${ci}`}
                    disabled={disabled}
                    align={summaryAlign}
                    sx={{ borderRight: "none" }}
                  >
                    <Typography
                      variant="b1Bold"
                      color={theme.colors.info[500]}
                      text={item.label ? `${item.label} ${text}` : text}
                      align={summaryAlign as any}
                    />
                  </TableTd>
                )
              }

              // * summary 대상이 아닌 컬럼은 빈 셀로 유지
              return (
                <TableTd
                  key={`${tableKey}_sum_empty_${li}_${ci}`}
                  disabled={disabled}
                  align={normalizeAlign((col as any).textAlign)}
                  sx={{ borderRight: "none" }}
                />
              )
            })}
          </TableTr>
        )
      })}
    </>
  )
}

export default TableSummaryRow
