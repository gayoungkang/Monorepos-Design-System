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
  rows?: T[] // * 호출부 계약용 (미사용)
  config: SummaryRowProps<T>
  disabled?: boolean
  gridColumns: string

  stickyBottom?: boolean
  rowHeight?: number
}
/**---------------------------------------------------------------------------/
 *
 * ! TableSummaryRow
 *
 * * 서버 집계값(config.data) 기반으로 Summary Row(요약/합계 행)를 렌더링하는 컴포넌트
 * * config.enabled=true 이고 config.data가 존재/비어있지 않을 때만 렌더링
 * * rows(원본 데이터)는 호출부 계약용으로만 받고 실제 합계 계산에는 사용하지 않음
 *
 * * 입력 계약
 *   * config.rows: 라인 정의(표시할 요약 항목/라벨 정보)
 *   * config.data: 라인별 집계값 배열([{ [colKey]: number }])
 *     - lines.length와 동일한 길이 권장
 *   * columns: 테이블 컬럼 정의(키 매칭/align 기준)
 *
 * * 렌더링 규칙
 *   * 라벨 컬럼(labelKey):
 *     * line.labelColumnKey가 있으면 해당 key 컬럼에 라벨 셀 배치
 *     * 없으면 columns[0]의 key를 라벨 컬럼으로 사용
 *     * line.labelCell이 있으면 그대로 렌더, 없으면 line.label 또는 "SUM" 텍스트 렌더
 *   * 값 컬럼:
 *     * line.items에서 현재 컬럼 key와 매칭되는 SummaryItem이 있으면 값 셀 렌더
 *     * 값은 sums[String(match.key)]에서 읽고 Number 캐스팅
 *     * formatter가 있으면 formatter 우선, 없으면 Intl.NumberFormat으로 콤마 포맷
 *     * match.label이 있으면 "label value" 형태로 조합
 *   * 그 외 컬럼은 빈 TableTd 렌더
 *
 * * 정렬(align) 처리
 *   * normalizeAlign(col.textAlign) 결과를 사용
 *   * 라벨 셀 기본: left
 *   * 값 셀 기본: right
 *
 * * sticky 하단 고정(stickyBottom)
 *   * 여러 줄 summary를 bottom에 겹치지 않게 누적 오프셋을 적용
 *   * baseOffset = (lines.length - 1 - li) * rowHeight
 *   * 현재 구현은 li가 마지막 줄이 아닌 경우(baseOffset > 0) 한 줄(rowHeight)만큼 추가로 보정
 *     - stickyOffset = baseOffset - rowHeight
 *     - 마지막 줄은 stickyOffset = 0
 *   * 목적: 마지막에 “빈 셀 1줄”이 더 생기는 케이스를 방지하기 위한 오프셋 보정
 *
 * * 스타일 처리
 *   * TableTr에 background/borderTop을 적용하여 본문과 시각적으로 분리
 *   * 요약 셀은 fontWeight: 700, Typography는 b1Bold로 강조
 *
 * @module TableSummaryRow
 * 서버 집계 기반의 하단 요약 행을 렌더링합니다.
 * - 다중 라인 요약을 지원하며, stickyBottom 옵션으로 하단 고정 시 오프셋을 보정합니다.
 *
 * @usage
 * <TableSummaryRow
 *   tableKey="t1"
 *   columns={columns}
 *   config={{
 *     enabled: true,
 *     rows: [{ label: "SUM", items: [{ key: "amount" }, { key: "count" }] }],
 *     data: [{ amount: 12345, count: 99 }],
 *   }}
 *   gridColumns={gridColumns}
 *   stickyBottom
 *   rowHeight={32}
 * />
 *
/---------------------------------------------------------------------------**/

const TableSummaryRow = <T extends Record<string, unknown>>({
  tableKey,
  columns,
  config,
  disabled,
  gridColumns,
  stickyBottom,
  rowHeight = 32,
}: Props<T>) => {
  // * summary row 활성화 및 서버 데이터 유효성 체크
  if (!config?.enabled) return null
  if (!config.data || config.data.length === 0) return null

  const lines = config.rows ?? []
  const serverData = config.data ?? []

  // * summary 라인이 없는 경우 렌더링하지 않음
  if (lines.length === 0) return null

  // * 숫자 기본 포맷 함수
  const formatNumber = (v: number) => new Intl.NumberFormat().format(v)

  return (
    <>
      {lines.map((line, li) => {
        const sums = serverData[li] ?? {}
        const labelKey = line.labelColumnKey ?? (columns[0]?.key as keyof T | undefined)

        // * stickyBottom 사용 시 summary row 간 offset 계산
        const baseOffset = (lines.length - 1 - li) * rowHeight
        const stickyOffset =
          stickyBottom && baseOffset > 0 ? baseOffset - rowHeight : stickyBottom ? 0 : 0

        return (
          <TableTr
            key={`${tableKey}_summary_${li}`}
            columns={gridColumns}
            disabled={disabled}
            stickyBottom={stickyBottom}
            stickyBottomOffset={stickyOffset}
            sx={{
              background: theme.colors.grayscale.white,
              borderTop: `1px solid ${theme.colors.border.default}`,
            }}
          >
            {columns.map((col, ci) => {
              const colKey = col.key as keyof T
              const match = line.items.find((it) => it.key === colKey)

              // * 라벨 컬럼 렌더링
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

              // * summary 값이 정의된 컬럼 렌더링
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

              // * summary 대상이 아닌 빈 셀
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
