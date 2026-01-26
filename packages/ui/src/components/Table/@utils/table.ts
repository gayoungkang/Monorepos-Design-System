import { SummaryItem } from "../_internal/TableSummaryRow"

// * 주어진 값을 최소/최대 범위로 제한하는 숫자 보정 유틸
export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

// * 테이블 정렬 값을 표준 정렬(left/center/right)로 정규화하는 유틸
export const normalizeAlign = (a: any): "left" | "center" | "right" | undefined => {
  if (a === "left" || a === "center" || a === "right") return a
  if (a === "start") return "left"
  if (a === "end") return "right"
  return undefined
}

// * 숫자/문자열/기타 타입을 안전한 number 값으로 변환하는 유틸
export const toNumber = (v: unknown) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

// * SummaryItem 정의를 기준으로 행 데이터의 합계를 계산하는 서버/뷰 공용 유틸
export const buildSums = <T extends Record<string, unknown>>(
  rows: T[],
  items: SummaryItem<T>[],
) => {
  const sums: Record<string, number> = {}
  for (const it of items) sums[String(it.key)] = 0

  for (const row of rows) {
    for (const it of items) {
      sums[String(it.key)] += toNumber(row[it.key])
    }
  }

  return sums
}

// * rowsPerPage 값을 최소 1 ~ 최대 limit 범위로 안전하게 정규화하는 유틸
export const clampRowsPerPage = (v: number, limit = 200) =>
  clamp(Math.max(1, Number(v || 1)), 1, Math.max(1, limit))

// * width 값을 px 단위 숫자로 변환(숫자/px 문자열/숫자 문자열 지원)하는 유틸
export const parseWidthToPx = (w?: string | number) => {
  if (w === undefined || w === null) return undefined
  if (typeof w === "number") return Number.isFinite(w) ? w : undefined
  const s = String(w).trim()
  if (s.endsWith("px")) {
    const n = Number(s.replace("px", ""))
    return Number.isFinite(n) ? n : undefined
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}
