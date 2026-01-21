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

  data?: Record<string, number>[]
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
 *
 * ! TableSummaryRow
 *
 * * 테이블 하단 합계/요약(summary) 행을 렌더링하는 컴포넌트
 * * config.enabled=false 이면 렌더링하지 않음(null 반환)
 * * rows(클라이언트 데이터) 또는 config.data(서버 집계값) 둘 중 하나라도 있어야 렌더링
 *
 * * 합계 데이터 생성 규칙
 *   * config.data가 존재하면(라인별 집계값) 해당 값을 우선 사용
 *     - config.rows.length 와 동일한 길이의 배열을 권장
 *     - 각 원소는 { [colKey]: number } 형태의 집계 맵
 *   * config.data가 없으면 buildSums(rows, line.items)로 클라이언트 합계 계산
 *
 * * 렌더링 구조
 *   * config.rows의 각 라인(line)을 순회하며 TableTr 1개씩 생성
 *   * columns를 순회하며 각 컬럼에 대응하는 TableTd를 생성
 *   * 라벨 셀 결정 규칙
 *     - line.labelColumnKey가 지정되면 해당 key 컬럼을 라벨 컬럼으로 사용
 *     - 미지정이면 첫 번째 컬럼(ci===0)을 라벨 컬럼으로 사용
 *     - line.labelCell이 있으면 이를 그대로 렌더
 *     - 없으면 line.label 또는 "SUM" 텍스트를 Typography로 렌더
 *
 * * 합계 셀 렌더링 규칙
 *   * line.items에 현재 컬럼(colKey)과 매칭되는 SummaryItem이 있으면 합계 셀로 처리
 *   * raw 값은 sums[colKey]를 사용하며 없으면 0
 *   * formatter가 있으면 formatter(raw), 없으면 Intl.NumberFormat()으로 포맷
 *   * item.label이 있으면 "{label} {text}" 형태로 출력
 *   * summaryAlign은 컬럼의 textAlign을 normalizeAlign 한 값(없으면 "right")
 *   * 매칭 아이템이 없으면 빈 TableTd를 렌더
 *
 * * sticky 하단 고정
 *   * config.sticky !== false 이면 하단 고정 활성화
 *   * rowHeight(32px) 기준으로 라인별 bottomOffset 계산
 *     - bottomOffset = rowHeight * (total - 1 - li)
 *   * TableTr에 stickyBottom / stickyBottomOffset 전달
 *
 * * 스타일/표현
 *   * 각 TableTd에 sx로 borderRight:"none" 적용(라인 내 셀 구분선 제거)
 *   * 합계 값 Typography는 theme.colors.info[500] 컬러를 사용
 *
 * @module TableSummaryRow
 * 테이블 하단에 합계/요약 행을 표시합니다.
 * - 서버 집계값(config.data) 또는 클라이언트 계산(buildSums) 기반으로 합계를 렌더링합니다.
 * - sticky 옵션으로 하단 고정 합계 행을 구성할 수 있습니다.
 *
 * @usage
 * <TableSummaryRow
 *   tableKey="t1"
 *   columns={columns}
 *   rows={rows}
 *   gridColumns={gridColumns}
 *   config={{
 *     enabled: true,
 *     sticky: true,
 *     rows: [
 *       { label: "합계", items: [{ key: "price", formatter: v => v.toLocaleString() }] },
 *     ],
 *   }}
 * />
 *
/---------------------------------------------------------------------------**/

const TableSummaryRow = <T extends Record<string, unknown>>({
  tableKey,
  columns,
  rows,
  config,
  disabled,
  gridColumns,
}: Props<T>) => {
  const stickyEnabled = config.sticky !== false
  const total = config.rows.length
  const rowHeight = 32

  // * 서버 집계값이 있으면 우선 사용, 없으면 rows 기반 합계 계산
  const sumMaps = useMemo(() => {
    if (config.data?.length) return config.data.map((m) => ({ ...(m ?? {}) }))
    return config.rows.map((line) => buildSums(rows, line.items))
  }, [rows, config.rows, config.data])

  // * enabled=false거나 (로컬 rows도 없고 서버 집계도 없으면) 렌더링하지 않음
  if (!config.enabled) return null
  if (!rows?.length && !config.data?.length) return null

  return (
    <>
      {config.rows.map((line, li) => {
        const sums = sumMaps[li] ?? {}
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

              // * 라벨 컬럼(지정 키 우선, 없으면 첫 번째 컬럼)
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

              const item = line.items.find((it) => it.key === colKey)
              if (item) {
                const raw = (sums as any)[String(colKey)] ?? 0
                const text = item.formatter
                  ? item.formatter(raw)
                  : new Intl.NumberFormat().format(raw)

                // * 합계는 기본 right 정렬(컬럼 정렬이 있으면 존중)
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
