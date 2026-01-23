// _internal/TableSummaryRow.tsx
// (타입 에러 수정: Props에 rows 추가. 사용은 안 하지만 Table.tsx 호출과 계약 일치)

import type { ReactNode } from "react"
import type { ColumnProps } from "../@Types/table"
import TableTr from "./TableTr"
import TableTd from "./TableTd"
import { normalizeAlign } from "../@utils/table"
import { Typography } from "../../Typography/Typography"
import { theme } from "../../../tokens/theme"

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
  rows: SummaryRowLine<T>[]
  data?: Record<string, number>[]
}

type Props<T extends Record<string, unknown>> = {
  tableKey: string
  columns: ColumnProps<T>[]
  rows?: T[] // ✅ 호출부 계약용 (미사용)
  config: SummaryRowProps<T>
  disabled?: boolean
  gridColumns: string
}

const TableSummaryRow = <T extends Record<string, unknown>>({
  tableKey,
  columns,
  config,
  disabled,
  gridColumns,
}: Props<T>) => {
  if (!config?.enabled) return null
  if (!config.data || config.data.length === 0) return null

  const lines = config.rows ?? []
  const serverData = config.data ?? []
  if (lines.length === 0) return null

  const formatNumber = (v: number) => new Intl.NumberFormat().format(v)

  return (
    <>
      {lines.map((line, li) => {
        const sums = serverData[li] ?? {}
        const labelKey = line.labelColumnKey ?? (columns[0]?.key as keyof T | undefined)

        return (
          <TableTr
            key={`${tableKey}_summary_${li}`}
            columns={gridColumns}
            disabled={disabled}
            sx={{
              background: theme.colors.grayscale.white,
              borderTop: `1px solid ${theme.colors.border.default}`,
            }}
          >
            {columns.map((col, ci) => {
              const colKey = col.key as keyof T
              const match = line.items.find((it) => it.key === colKey)

              if (labelKey && colKey === labelKey) {
                return (
                  <TableTd
                    key={`${tableKey}_summary_${li}_${ci}`}
                    align={normalizeAlign(col.textAlign) ?? "left"}
                    disabled={disabled}
                    sx={{ fontWeight: 700 }}
                  >
                    {line.labelCell ?? (
                      <Typography
                        variant="b1Bold"
                        text={line.label ?? "SUM"}
                        sx={{ display: "inline-block" }}
                      />
                    )}
                  </TableTd>
                )
              }

              if (match) {
                const raw = Number(sums[String(match.key)] ?? 0)
                const text = match.formatter ? match.formatter(raw) : formatNumber(raw)
                const out = match.label ? `${match.label} ${text}` : text

                return (
                  <TableTd
                    key={`${tableKey}_summary_${li}_${ci}`}
                    align={normalizeAlign(col.textAlign) ?? "right"}
                    disabled={disabled}
                    sx={{ fontWeight: 700 }}
                  >
                    <Typography variant="b1Bold" text={out} sx={{ display: "inline-block" }} />
                  </TableTd>
                )
              }

              return (
                <TableTd
                  key={`${tableKey}_summary_${li}_${ci}`}
                  align={normalizeAlign(col.textAlign)}
                  disabled={disabled}
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
