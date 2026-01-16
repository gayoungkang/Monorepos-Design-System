import { SummaryItem } from "../@Types/summaryRow"

export const normalizeAlign = (a: any): "left" | "center" | "right" | undefined => {
  if (a === "left" || a === "center" || a === "right") return a
  if (a === "start") return "left"
  if (a === "end") return "right"
  return undefined
}

export const toNumber = (v: unknown) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

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
