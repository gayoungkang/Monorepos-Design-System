// useTableController.ts
import { useEffect, useMemo, useRef, useState } from "react"

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export type ServerTableSort = {
  key: string
  direction: "ASC" | "DESC"
}

export type ServerTableFilter = {
  key: string
  operator?: string
  value?: unknown
}

export type ServerTableQuery = {
  page: number
  rowsPerPage: number
  keyword: string
  sort?: ServerTableSort
  filters?: ServerTableFilter[]
}

type TableConfig = {
  page?: number
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  totalCount?: number
  handleOnRowsPerPageChange?: (e: any) => void
}

type Params = {
  disabled?: boolean

  tableConfig?: TableConfig

  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void

  controlledKeyword?: string
  onKeywordChange?: (keyword: string) => void

  sort?: ServerTableSort
  filters?: ServerTableFilter[]

  onQueryChange?: (q: ServerTableQuery) => void
  searchDebounceMs?: number

  maxRowsPerPageLimit?: number
}

const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

export const useTableController = ({
  disabled,

  tableConfig,

  onPageChange,
  onRowsPerPageChange,

  controlledKeyword,
  onKeywordChange,

  sort,
  filters,

  onQueryChange,
  searchDebounceMs = 300,

  maxRowsPerPageLimit = 200,
}: Params) => {
  const rowsPerPageOptions = useMemo(() => {
    const base = tableConfig?.rowsPerPageOptions?.length
      ? tableConfig.rowsPerPageOptions
      : [10, 25, 50, 100]
    const lim = Math.max(1, maxRowsPerPageLimit)
    const filtered = base.filter((n) => Number.isFinite(n) && n > 0 && n <= lim)
    return filtered.length ? filtered : [Math.min(100, lim)]
  }, [tableConfig?.rowsPerPageOptions, maxRowsPerPageLimit])

  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number>(
    Math.max(1, tableConfig?.rowsPerPage ?? rowsPerPageOptions[0] ?? 10),
  )
  const [internalPage, setInternalPage] = useState<number>(Math.max(1, tableConfig?.page ?? 1))

  const isControlledRowsPerPage = typeof tableConfig?.rowsPerPage === "number"
  const isControlledPage = typeof tableConfig?.page === "number"

  const rowsPerPage = useMemo(() => {
    const rp = isControlledRowsPerPage ? (tableConfig?.rowsPerPage as number) : internalRowsPerPage
    const normalized = Math.max(1, rp || rowsPerPageOptions[0] || 10)
    return clamp(normalized, 1, Math.max(1, maxRowsPerPageLimit))
  }, [
    isControlledRowsPerPage,
    tableConfig?.rowsPerPage,
    internalRowsPerPage,
    rowsPerPageOptions,
    maxRowsPerPageLimit,
  ])

  const page = useMemo(() => {
    const p = isControlledPage ? (tableConfig?.page as number) : internalPage
    return Math.max(1, p || 1)
  }, [isControlledPage, tableConfig?.page, internalPage])

  const [internalKeyword, setInternalKeyword] = useState("")
  const keyword = controlledKeyword ?? internalKeyword
  const debouncedKeywordForServer = useDebouncedValue(keyword ?? "", searchDebounceMs)

  const totalCount = useMemo(
    () => Math.max(0, tableConfig?.totalCount ?? 0),
    [tableConfig?.totalCount],
  )

  const pageCount = useMemo(() => {
    if (totalCount <= 0) return 1
    return Math.max(1, Math.ceil(totalCount / rowsPerPage))
  }, [totalCount, rowsPerPage])

  const safePage = useMemo(() => clamp(page, 1, pageCount), [page, pageCount])

  useEffect(() => {
    const next = clamp(safePage, 1, pageCount)
    if (next === safePage) return
    if (onPageChange) onPageChange(next)
    else setInternalPage(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount])

  const fromTo = useMemo(() => {
    if (totalCount <= 0) return { from: 0, to: 0 }
    const from = (safePage - 1) * rowsPerPage + 1
    const to = Math.min(totalCount, safePage * rowsPerPage)
    return { from, to }
  }, [totalCount, safePage, rowsPerPage])

  const setPage = (nextPage: number) => {
    if (disabled) return
    const next = clamp(nextPage, 1, pageCount)
    onPageChange?.(next)
    if (!isControlledPage) setInternalPage(next)
  }

  const setRowsPerPage = (nextRowsPerPage: number) => {
    if (disabled) return

    const nextRp = clamp(Math.max(1, nextRowsPerPage), 1, Math.max(1, maxRowsPerPageLimit))

    tableConfig?.handleOnRowsPerPageChange?.({ target: { value: nextRp } as any } as any)
    onRowsPerPageChange?.(nextRp)

    if (!isControlledRowsPerPage) setInternalRowsPerPage(nextRp)

    const nextPage = 1
    onPageChange?.(nextPage)
    if (!isControlledPage) setInternalPage(nextPage)
  }

  const setKeyword = (next: string) => {
    if (disabled) return
    onKeywordChange?.(next)
    if (controlledKeyword === undefined) setInternalKeyword(next)

    const nextPage = 1
    onPageChange?.(nextPage)
    if (!isControlledPage) setInternalPage(nextPage)
  }

  const lastQueryRef = useRef<string>("")
  useEffect(() => {
    if (!onQueryChange) return

    const q: ServerTableQuery = {
      page: safePage,
      rowsPerPage,
      keyword: String(debouncedKeywordForServer ?? ""),
      sort,
      filters,
    }

    const sig = JSON.stringify(q)
    if (sig === lastQueryRef.current) return

    lastQueryRef.current = sig
    onQueryChange(q)
  }, [onQueryChange, safePage, rowsPerPage, debouncedKeywordForServer, sort, filters])

  return {
    rowsPerPageOptions,
    rowsPerPage,
    page: safePage,
    pageCount,
    totalCount,
    fromTo,
    keyword,

    setPage,
    setRowsPerPage,
    setKeyword,
  }
}
