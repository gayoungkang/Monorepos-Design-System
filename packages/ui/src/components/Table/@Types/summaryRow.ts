// Table/@Types/summaryRow.ts
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
