import { useEffect, useMemo, useRef, useState } from "react"

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

const toCellText = (v: unknown) => {
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export type ServerTableQuery = {
  page: number
  rowsPerPage: number
  keyword: string
}

type Params<T extends Record<string, unknown>> = {
  mode: "client" | "server"
  disabled?: boolean

  data: T[]
  columnKeysForSearch: (keyof T)[]

  tableConfig?: {
    page?: number
    rowsPerPage?: number
    rowsPerPageOptions?: number[]
    totalCount?: number
    handleOnRowsPerPageChange?: (e: any) => void
  }

  // external
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void

  // search
  controlledKeyword?: string
  onKeywordChange?: (keyword: string) => void

  // server query
  onQueryChange?: (q: ServerTableQuery) => void
  searchDebounceMs?: number
}

const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

export const useTableController = <T extends Record<string, unknown>>({
  mode,
  disabled,

  data,
  columnKeysForSearch,

  tableConfig,

  onPageChange,
  onRowsPerPageChange,

  controlledKeyword,
  onKeywordChange,

  onQueryChange,
  searchDebounceMs = 300,
}: Params<T>) => {
  const rowsPerPageOptions = useMemo(
    () =>
      tableConfig?.rowsPerPageOptions?.length ? tableConfig.rowsPerPageOptions : [10, 25, 50, 100],
    [tableConfig?.rowsPerPageOptions],
  )

  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number>(
    Math.max(1, tableConfig?.rowsPerPage ?? rowsPerPageOptions[0] ?? 10),
  )
  const [internalPage, setInternalPage] = useState<number>(Math.max(1, tableConfig?.page ?? 1))

  const isControlledRowsPerPage = typeof tableConfig?.rowsPerPage === "number"
  const isControlledPage = typeof tableConfig?.page === "number"

  const rowsPerPage = useMemo(() => {
    const rp = isControlledRowsPerPage ? (tableConfig?.rowsPerPage as number) : internalRowsPerPage
    return Math.max(1, rp || rowsPerPageOptions[0] || 10)
  }, [isControlledRowsPerPage, tableConfig?.rowsPerPage, internalRowsPerPage, rowsPerPageOptions])

  const page = useMemo(() => {
    const p = isControlledPage ? (tableConfig?.page as number) : internalPage
    return Math.max(1, p || 1)
  }, [isControlledPage, tableConfig?.page, internalPage])

  const [internalKeyword, setInternalKeyword] = useState("")
  const keyword = controlledKeyword ?? internalKeyword
  const debouncedKeywordForServer = useDebouncedValue(keyword ?? "", searchDebounceMs)

  const filteredRows = useMemo(() => {
    if (mode !== "client") return data
    const q = (keyword ?? "").trim().toLowerCase()
    if (!q) return data

    return (data ?? []).filter((row) =>
      columnKeysForSearch.some((k) => toCellText(row[k]).toLowerCase().includes(q)),
    )
  }, [mode, data, keyword, columnKeysForSearch])

  const totalCount = useMemo(() => {
    if (mode === "server") return Math.max(0, tableConfig?.totalCount ?? 0)
    return Math.max(0, filteredRows.length ?? 0)
  }, [mode, tableConfig?.totalCount, filteredRows.length])

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

  const pageRows = useMemo(() => {
    if (mode === "server") return data
    const start = (safePage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredRows.slice(start, end)
  }, [mode, data, filteredRows, safePage, rowsPerPage])

  const setPage = (nextPage: number) => {
    if (disabled) return
    const next = clamp(nextPage, 1, pageCount)
    onPageChange?.(next)
    if (!isControlledPage) setInternalPage(next)
  }

  const setRowsPerPage = (nextRowsPerPage: number) => {
    if (disabled) return

    tableConfig?.handleOnRowsPerPageChange?.({ target: { value: nextRowsPerPage } as any } as any)
    onRowsPerPageChange?.(nextRowsPerPage)

    if (!isControlledRowsPerPage) setInternalRowsPerPage(nextRowsPerPage)

    const nextPage = 1
    onPageChange?.(nextPage)
    if (!isControlledPage) setInternalPage(nextPage)
  }

  const setKeyword = (next: string) => {
    if (disabled) return
    onKeywordChange?.(next)
    if (controlledKeyword === undefined) setInternalKeyword(next)

    if (mode === "server") {
      const nextPage = 1
      onPageChange?.(nextPage)
      if (!isControlledPage) setInternalPage(nextPage)
    }
  }

  const lastQueryRef = useRef<string>("")
  useEffect(() => {
    if (mode !== "server") return
    if (!onQueryChange) return

    const q: ServerTableQuery = {
      page: safePage,
      rowsPerPage,
      keyword: String(debouncedKeywordForServer ?? ""),
    }
    const sig = `${q.page}|${q.rowsPerPage}|${q.keyword}`
    if (sig === lastQueryRef.current) return

    lastQueryRef.current = sig
    onQueryChange(q)
  }, [mode, onQueryChange, safePage, rowsPerPage, debouncedKeywordForServer])

  return {
    rowsPerPageOptions,
    rowsPerPage,
    page: safePage,
    pageCount,
    totalCount,
    fromTo,
    keyword,

    filteredRows,
    pageRows,

    setPage,
    setRowsPerPage,
    setKeyword,
  }
}
