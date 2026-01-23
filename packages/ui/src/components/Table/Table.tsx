// Table.tsx
import { JSX, useEffect, useMemo, useRef, useState } from "react"
import Pagination from "../Pagination/Pagination"
import { Typography } from "../Typography/Typography"
import type {
  ColumnProps,
  ServerTableQuery,
  SortDirection,
  TableProps,
  VirtualizedOptions,
} from "./@Types/table"
import TableContainer from "./_internal/TableContainer"
import TableHead from "./_internal/TableHead"
import TableRow from "./_internal/TableRow"
import TableTd from "./_internal/TableTd"
import TableTh from "./_internal/TableTh"
import TableTr from "./_internal/TableTr"
import Flex from "../Flex/Flex"
import TableTotalRows from "./_internal/TableTotalRows"
import TableRowsPerPage from "./_internal/TableRowsPerPage"
import TableSummaryRow from "./_internal/TableSummaryRow"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"
import type { ExportType } from "./_internal/TableExport"
import TableToolBar from "./_internal/TableToolBar"

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
const clampRowsPerPage = (v: number, limit = 200) =>
  clamp(Math.max(1, Number(v || 1)), 1, Math.max(1, limit))

const parseWidthToPx = (w?: string | number) => {
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

const Table = <T extends Record<string, unknown>>(props: TableProps<T>): JSX.Element => {
  const {
    tableKey,
    columnConfig,
    data = [],

    // * server-controlled (single source of truth)
    query,
    totalCount,
    rowsPerPageOptions = [10, 25, 50, 100],
    onQueryChange,

    // * view-only row events
    onRowClick,
    rowActions,

    // * layout
    sticky = true,
    height = 300,
    emptyRowText,
    disabled = false,
    pagination,
    totalRows = true,
    rowsPer = true,
    summaryRow,
    customTableHeader,

    // * toolbar
    toolbar,

    // * export (server job only)
    exportEnabled = false,
    exportItems,
    excludeExportTypes,
    onExport,
    exportContext,

    // * virtualization
    virtualized,

    ...baseProps
  } = props

  // ---------------------------------------------------------------------------
  // * Controlled query normalization (rowsPerPage cap + page bounds)
  // ---------------------------------------------------------------------------
  const safeTotalCount = useMemo(() => Math.max(0, Number(totalCount ?? 0) || 0), [totalCount])

  const safeRowsPerPageOptions = useMemo(() => {
    const lim = 200
    const out = (rowsPerPageOptions ?? [])
      .filter((n) => Number.isFinite(n) && n > 0 && n <= lim)
      .map((n) => Math.floor(n))
    return out.length ? out : [Math.min(100, lim)]
  }, [rowsPerPageOptions])

  const safeRowsPerPage = useMemo(() => {
    const fallback = safeRowsPerPageOptions[0] ?? 10
    return clampRowsPerPage(query?.rowsPerPage ?? fallback, 200)
  }, [query?.rowsPerPage, safeRowsPerPageOptions])

  const pageCount = useMemo(() => {
    if (safeTotalCount <= 0) return 1
    return Math.max(1, Math.ceil(safeTotalCount / safeRowsPerPage))
  }, [safeTotalCount, safeRowsPerPage])

  const safePage = useMemo(
    () => clamp(Math.max(1, Number(query?.page ?? 1) || 1), 1, pageCount),
    [query?.page, pageCount],
  )

  useEffect(() => {
    const nextKeyword = String(query?.keyword ?? "")
    if (
      (query?.page ?? 1) !== safePage ||
      (query?.rowsPerPage ?? 0) !== safeRowsPerPage ||
      (query?.keyword ?? "") !== nextKeyword
    ) {
      onQueryChange({
        ...query,
        page: safePage,
        rowsPerPage: safeRowsPerPage,
        keyword: nextKeyword,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage, safeRowsPerPage])

  const emitQuery = (partial: Partial<ServerTableQuery>) => {
    if (disabled) return

    const next: ServerTableQuery = {
      ...query,
      page: partial.page ?? query.page,
      rowsPerPage: partial.rowsPerPage ?? query.rowsPerPage,
      keyword: partial.keyword ?? query.keyword,
      sort: partial.sort ?? query.sort,
      filters: partial.filters ?? query.filters,
    }

    const normalizedRowsPerPage = clampRowsPerPage(next.rowsPerPage, 200)
    const normalizedPage = clamp(
      Math.max(1, next.page || 1),
      1,
      Math.max(1, Math.ceil(safeTotalCount / normalizedRowsPerPage) || 1),
    )

    onQueryChange({
      ...next,
      page: normalizedPage,
      rowsPerPage: normalizedRowsPerPage,
      keyword: String(next.keyword ?? ""),
    })
  }

  // ---------------------------------------------------------------------------
  // * Column widths + drag resize (RAF)
  // ---------------------------------------------------------------------------
  const [colPx, setColPx] = useState<number[]>(() =>
    (columnConfig as ColumnProps<T>[]).map((c) => parseWidthToPx(c.width as any) ?? 160),
  )

  useEffect(() => {
    setColPx((prev) => {
      if (prev.length === columnConfig.length) return prev
      return (columnConfig as ColumnProps<T>[]).map(
        (c, i) => prev[i] ?? parseWidthToPx(c.width as any) ?? 160,
      )
    })
  }, [columnConfig])

  const dragRef = useRef<{ active: boolean; colIndex: number; startX: number; startW: number }>({
    active: false,
    colIndex: -1,
    startX: 0,
    startW: 0,
  })

  const rafResizeRef = useRef<number | null>(null)
  const pendingResizeRef = useRef<{ colIndex: number; width: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const nextW = clamp(dragRef.current.startW + dx, 60, 2000)

      pendingResizeRef.current = { colIndex: dragRef.current.colIndex, width: nextW }
      if (rafResizeRef.current !== null) return

      rafResizeRef.current = window.requestAnimationFrame(() => {
        rafResizeRef.current = null
        const pending = pendingResizeRef.current
        if (!pending) return
        setColPx((prev) => {
          const next = [...prev]
          next[pending.colIndex] = pending.width
          return next
        })
      })
    }

    const onUp = () => {
      if (!dragRef.current.active) return
      dragRef.current.active = false
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      if (rafResizeRef.current !== null) {
        window.cancelAnimationFrame(rafResizeRef.current)
        rafResizeRef.current = null
      }
    }
  }, [])

  const startResize = (colIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { active: true, colIndex, startX: e.clientX, startW: colPx[colIndex] ?? 160 }
  }

  const gridColumns = useMemo(() => {
    const base = colPx.map((w) => `${w}px`).join(" ")
    const actionCols = (rowActions?.length ?? 0) > 0 ? rowActions!.map(() => `80px`).join(" ") : ""
    return actionCols ? `${base} ${actionCols}` : base
  }, [colPx, rowActions])

  // ---------------------------------------------------------------------------
  // * Horizontal scroll sync (header/body/summary)
  //   - Body only scrolls (overflow:auto)
  //   - Header + Summary are outside body scroll, and sync by translateX(-scrollLeft)
  // ---------------------------------------------------------------------------
  const bodyScrollRef = useRef<HTMLDivElement | null>(null)
  const rafScrollRef = useRef<number | null>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportH, setViewportH] = useState(0)

  useEffect(() => {
    const el = bodyScrollRef.current
    if (!el) return

    const sync = () => {
      setScrollLeft(el.scrollLeft)
      setScrollTop(el.scrollTop)
      setViewportH(el.clientHeight)
    }

    sync()

    const onScroll = () => {
      if (rafScrollRef.current !== null) return
      rafScrollRef.current = window.requestAnimationFrame(() => {
        rafScrollRef.current = null
        sync()
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => sync())
      ro.observe(el)
    } else {
      window.addEventListener("resize", sync)
    }

    return () => {
      el.removeEventListener("scroll", onScroll as any)
      if (ro) ro.disconnect()
      else window.removeEventListener("resize", sync)
      if (rafScrollRef.current !== null) {
        window.cancelAnimationFrame(rafScrollRef.current)
        rafScrollRef.current = null
      }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // * Virtualization (fixed rowHeight + overscan) - body rows only
  // ---------------------------------------------------------------------------
  const vOpt: VirtualizedOptions | undefined = virtualized?.enabled ? virtualized : undefined
  const rowHeight = vOpt?.rowHeight ?? 0
  const overscan = vOpt?.overscan ?? 6
  const totalRowsCount = data?.length ?? 0

  const virtualRange = useMemo(() => {
    if (!vOpt || rowHeight <= 0) return { start: 0, end: totalRowsCount, padTop: 0, padBottom: 0 }

    const start = clamp(
      Math.floor(scrollTop / rowHeight) - overscan,
      0,
      Math.max(0, totalRowsCount),
    )
    const visibleCount = Math.ceil(viewportH / rowHeight) + overscan * 2
    const end = clamp(start + visibleCount, 0, Math.max(0, totalRowsCount))
    const padTop = start * rowHeight
    const padBottom = Math.max(0, (totalRowsCount - end) * rowHeight)

    return { start, end, padTop, padBottom }
  }, [vOpt, rowHeight, overscan, scrollTop, viewportH, totalRowsCount])

  const visibleRows = useMemo(() => {
    if (!vOpt) return data ?? []
    return (data ?? []).slice(virtualRange.start, virtualRange.end)
  }, [vOpt, data, virtualRange.start, virtualRange.end])

  // ---------------------------------------------------------------------------
  // * Sort (server trigger only)
  // ---------------------------------------------------------------------------
  const getSortValue = (colSort?: boolean, colSortDirection?: SortDirection) => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

  // ---------------------------------------------------------------------------
  // * Export (server job only)
  // ---------------------------------------------------------------------------
  const handleExport = (type: ExportType) => {
    if (!exportEnabled || disabled) return
    if (!onExport) return

    const baseCtx =
      exportContext && typeof exportContext === "object"
        ? (exportContext as Record<string, unknown>)
        : ({} as Record<string, unknown>)

    onExport(
      type as any,
      {
        ...baseCtx,
        page: safePage,
        rowsPerPage: safeRowsPerPage,
        keyword: String(query.keyword ?? ""),
        sort: query.sort,
        filters: query.filters,
      } as any,
    )
  }

  // ---------------------------------------------------------------------------
  // * Summary visibility + layout (no sticky; always visible at bottom)
  // ---------------------------------------------------------------------------
  const summaryEnabled = Boolean(summaryRow?.enabled && (summaryRow as any)?.data?.length)
  const summaryLineCount = summaryEnabled ? ((summaryRow as any)?.rows?.length ?? 0) : 0
  const summaryRowHeight = 32
  const summaryHeight = summaryEnabled ? summaryLineCount * summaryRowHeight : 0

  // ---------------------------------------------------------------------------
  // * Pagination label
  // ---------------------------------------------------------------------------
  const fromTo = useMemo(() => {
    if (safeTotalCount <= 0) return { from: 0, to: 0 }
    const from = (safePage - 1) * safeRowsPerPage + 1
    const to = Math.min(safeTotalCount, safePage * safeRowsPerPage)
    return { from, to }
  }, [safeTotalCount, safePage, safeRowsPerPage])

  const paginationLabel = useMemo(
    () => `${fromTo.from}–${fromTo.to} of ${safeTotalCount}`,
    [fromTo.from, fromTo.to, safeTotalCount],
  )

  // ---------------------------------------------------------------------------
  // * Header / Body / Summary renderers
  // ---------------------------------------------------------------------------
  const headerInnerStyle: React.CSSProperties = useMemo(
    () => ({
      transform: `translateX(${-scrollLeft}px)`,
      willChange: "transform",
    }),
    [scrollLeft],
  )

  const renderHeader = () => {
    return (
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={headerInnerStyle}>
          <TableHead sticky={sticky} top={"0px"}>
            {customTableHeader ?? null}
            <TableTr columns={gridColumns} disabled={disabled}>
              {(columnConfig as ColumnProps<T>[]).map((col, idx) => {
                const sortValue = getSortValue(col.sort, col.sortDirection)
                const sortEnabled = !disabled && col.sort && col.onSortChange

                return (
                  <TableTh
                    key={`${tableKey}_th_${String(col.title)}_${idx}`}
                    align={col.textAlign as any}
                    sort={sortEnabled ? sortValue : undefined}
                    onSortChange={
                      sortEnabled
                        ? (nextDirection) => col.onSortChange?.(col.key as keyof T, nextDirection)
                        : undefined
                    }
                    resizable={!disabled}
                    onResizeStart={startResize(idx)}
                    sx={{ userSelect: "none" }}
                  >
                    {col.title}
                  </TableTh>
                )
              })}

              {(rowActions?.length ?? 0) > 0
                ? rowActions!.map((a) => (
                    <TableTh
                      key={`${tableKey}_th_action_${a.key}`}
                      align="center"
                      sx={{ userSelect: "none" }}
                    >
                      {""}
                    </TableTh>
                  ))
                : null}
            </TableTr>
          </TableHead>
        </div>
      </div>
    )
  }

  const renderBodyRowsOnly = () => {
    if ((data ?? []).length === 0) {
      return (
        <TableTr columns={gridColumns} disabled={disabled}>
          <TableTd
            colSpan={(columnConfig?.length ?? 0) + (rowActions?.length ?? 0)}
            align="center"
            disabled={disabled}
          >
            <Typography
              text={emptyRowText ?? "검색 결과가 없습니다."}
              align="center"
              sx={{ display: "inline-block" }}
            />
          </TableTd>
        </TableTr>
      )
    }

    return (
      <>
        {vOpt ? <div style={{ height: virtualRange.padTop }} /> : null}

        {(visibleRows ?? []).map((row, ri) => {
          const realIndex = vOpt ? virtualRange.start + ri : ri

          const keyCandidate: any =
            (row as any)?.id ?? (row as any)?.key ?? (row as any)?._id ?? (row as any)?.rowId
          const rowKey =
            keyCandidate !== undefined && keyCandidate !== null
              ? String(keyCandidate)
              : `${tableKey}_${realIndex}`

          return (
            <TableRow
              key={`${tableKey}_row_${rowKey}`}
              columnConfig={columnConfig as any}
              data={row as any}
              index={realIndex}
              tableKey={tableKey}
              disabled={disabled}
              columns={gridColumns}
              onRowClick={onRowClick as any}
              rowActions={rowActions as any}
            />
          )
        })}

        {vOpt ? <div style={{ height: virtualRange.padBottom }} /> : null}
      </>
    )
  }

  const renderSummary = () => {
    if (!summaryEnabled) return null

    return (
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={headerInnerStyle}>
          <TableSummaryRow
            tableKey={tableKey}
            columns={columnConfig as any}
            rows={[] as any}
            config={summaryRow as any}
            disabled={disabled}
            gridColumns={gridColumns}
          />
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // * Toolbar conditions
  // ---------------------------------------------------------------------------
  const shouldRenderToolbar =
    Boolean(toolbar?.searchEnabled) ||
    Boolean(toolbar?.filterEnabled) ||
    Boolean(toolbar?.columnVisibilityEnabled) ||
    Boolean(exportEnabled && onExport && (exportItems?.length ?? 0) > 0)

  return (
    <>
      {shouldRenderToolbar ? (
        <TableToolBar
          {...(toolbar as any)}
          disabled={disabled}
          title={toolbar?.title}
          searchValue={String(query.keyword ?? "")}
          onSearchChange={(v) => emitQuery({ keyword: v, page: 1 })}
          exportEnabled={exportEnabled}
          exportItems={exportItems as any}
          excludeExportTypes={excludeExportTypes as any}
          onExport={onExport ? (type: any, ctx: unknown) => handleExport(type) : undefined}
          exportContext={exportContext}
        />
      ) : null}

      <TableContainer {...baseProps}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height,
            minHeight: 0,
            width: "100%",
            background: theme.colors.grayscale.white,
          }}
        >
          {renderHeader()}

          <div
            ref={bodyScrollRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              // * Summary가 항상 보이므로 본문과 겹침 방지용 패딩
              paddingBottom: summaryHeight,
            }}
          >
            <Box>{renderBodyRowsOnly()}</Box>
          </div>

          {renderSummary()}
        </div>
      </TableContainer>

      <Flex
        align="center"
        justify="space-between"
        mt={2}
        p={"2px 5px"}
        bgColor={theme.colors.grayscale.white}
        sx={{
          position: "relative",
          borderRadius: theme.borderRadius[4],
          border: `1px solid ${theme.colors.border.default}`,
        }}
      >
        <Flex align="center" gap={4}>
          {rowsPer ? (
            <TableRowsPerPage
              rowsPerPage={safeRowsPerPage}
              rowsPerPageOptions={safeRowsPerPageOptions}
              onRowsPerPageChange={(rp) =>
                emitQuery({ rowsPerPage: clampRowsPerPage(rp, 200), page: 1 })
              }
              disabled={disabled}
              maxRowsPerPageLimit={200}
            />
          ) : null}
          {totalRows ? <TableTotalRows ml={4} totalRows={safeTotalCount} /> : null}
        </Flex>

        {pagination ? (
          <Pagination
            type={pagination as any}
            disabled={disabled}
            count={safeTotalCount}
            page={safePage}
            pageCount={pageCount}
            onPageChange={(p) => emitQuery({ page: p })}
            labelDisplayedRows={() => paginationLabel}
            showPrevNextButtons
            showFirstLastButtons
          />
        ) : null}
      </Flex>
    </>
  )
}

export default Table
