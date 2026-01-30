import type { ReactNode, JSX } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import type {
  ColumnProps,
  ServerTableQuery,
  SortDirection,
  VirtualizedOptions,
} from "./@Types/table"
import TableContainer from "./_internal/TableContainer"
import TableHead from "./_internal/TableHead"
import TableRow from "./_internal/TableRow"
import TableTd from "./_internal/TableTd"
import TableTh from "./_internal/TableTh"
import TableTr from "./_internal/TableTr"
import TableSummaryRow, { type SummaryRowProps } from "./_internal/TableSummaryRow"
import TableToolBar, { type TableToolBarProps } from "./_internal/TableToolbar"
import TableTotalRows from "./_internal/TableTotalRows"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"
import type { ExportType } from "./_internal/TableExport"
import Progress from "../Progress/Progress"

import { clamp, parseWidthToPx } from "./@utils/table"
import useIntersect from "./@hooks/useIntersect"

export type TableRowAction<T extends Record<string, unknown>> = {
  key: string
  render: (row: T, index: number) => ReactNode
}

export type InfiniteTableProps<T extends Record<string, unknown>> = {
  tableKey: string
  columnConfig: ColumnProps<T>[]
  data?: T[]

  // * infinite
  loading?: boolean
  hasMore?: boolean
  loadMore?: () => void

  // * server-controlled (single source of truth)
  query: ServerTableQuery
  onQueryChange: (next: ServerTableQuery) => void
  totalCount?: number

  // * view-only
  onRowClick?: (row: T, index: number) => void
  rowActions?: TableRowAction<T>[]

  // * layout
  sticky?: boolean
  height?: number
  emptyRowText?: string
  disabled?: boolean
  summaryRow?: SummaryRowProps<T>
  customTableHeader?: JSX.Element | null

  // * toolbar
  toolbar?: TableToolBarProps

  // * export (server job only)
  exportEnabled?: boolean
  exportItems?: { type: any; label: string; icon?: string }[]
  excludeExportTypes?: any[]
  onExport?: (type: any, ctx: unknown) => void
  exportContext?: unknown

  // * virtualization
  virtualized?: VirtualizedOptions
}

const InfiniteTable = <T extends Record<string, unknown>>({
  tableKey,
  columnConfig,
  data = [],

  // * infinite
  loading = false,
  hasMore = false,
  loadMore,

  // * server-controlled
  query,
  onQueryChange,
  totalCount,

  // * view-only
  onRowClick,
  rowActions,

  // * layout
  sticky = true,
  height = 300,
  emptyRowText,
  disabled = false,
  summaryRow,
  customTableHeader,

  // * toolbar
  toolbar,

  // * export
  exportEnabled = false,
  exportItems,
  excludeExportTypes,
  onExport,
  exportContext,

  // * virtualization
  virtualized,

  ...baseProps
}: InfiniteTableProps<T>): JSX.Element => {
  // * server query emit (single source of truth) - page/rowsPerPage는 유지하되 UI는 미노출
  const emitQuery = (partial: Partial<ServerTableQuery>) => {
    if (disabled) return

    const next: ServerTableQuery = {
      ...query,
      page: query.page,
      rowsPerPage: query.rowsPerPage,
      keyword: partial.keyword ?? query.keyword,
      sort: partial.sort ?? query.sort,
      filters: partial.filters ?? query.filters,
    }

    onQueryChange({
      ...next,
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
    const base = colPx.map((w) => `${Math.max(60, Math.floor(w))}px`).join(" ")
    const actionCols = (rowActions?.length ?? 0) > 0 ? rowActions!.map(() => `80px`).join(" ") : ""
    return actionCols ? `${base} ${actionCols}` : base
  }, [colPx, rowActions])

  // ---------------------------------------------------------------------------
  // * Scroll sync (header translateX) + virtualization range
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

  const headerInnerStyle: React.CSSProperties = useMemo(
    () => ({
      transform: `translateX(${-scrollLeft}px)`,
      willChange: "transform",
    }),
    [scrollLeft],
  )

  const getSortValue = (colSort?: boolean, colSortDirection?: SortDirection) => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

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
        keyword: String(query.keyword ?? ""),
        sort: query.sort,
        filters: query.filters,
      } as unknown,
    )
  }

  const summaryEnabled = Boolean(summaryRow?.enabled && (summaryRow?.data?.length ?? 0) > 0)
  const summaryRowHeight = 32

  // ---------------------------------------------------------------------------
  // * infinite intersect trigger
  // ---------------------------------------------------------------------------

  const {
    ref: bottomRef,
    enabled: intersectEnabled,
    setEnabled: setIntersectEnabled,
  } = useIntersect(() => {
    if (disabled) return
    if (!hasMore) return
    if (loading) return
    if (!loadMore) return

    setIntersectEnabled(false)
    loadMore()
  })

  useEffect(() => {
    if (disabled) return
    if (!hasMore) return
    if (loading) return
    if (!intersectEnabled) setIntersectEnabled(true)
  }, [disabled, hasMore, loading, intersectEnabled, setIntersectEnabled])

  // ---------------------------------------------------------------------------
  // * render
  // ---------------------------------------------------------------------------

  const shouldRenderToolbar =
    Boolean(toolbar?.searchEnabled) ||
    Boolean(toolbar?.filterEnabled) ||
    Boolean(toolbar?.columnVisibilityEnabled) ||
    Boolean(exportEnabled && onExport && (exportItems?.length ?? 0) > 0)

  const renderHeader = () => {
    return (
      <Box sx={{ position: "relative", overflow: "hidden" }}>
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
                ? rowActions!.map((a: TableRowAction<T>, ai: number) => (
                    <TableTh
                      key={`${tableKey}_th_action_${String(a.key)}_${ai}`}
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
      </Box>
    )
  }

  const renderBodyRowsOnly = () => {
    const actionCount = rowActions?.length ?? 0
    const colSpanAll = (columnConfig?.length ?? 0) + actionCount

    if ((data ?? []).length === 0) {
      return (
        <TableTr columns={gridColumns} disabled={disabled}>
          <TableTd colSpan={colSpanAll} align="center" disabled={disabled}>
            <Typography text={emptyRowText ?? "검색 결과가 없습니다."} align="center" />
          </TableTd>
        </TableTr>
      )
    }

    return (
      <>
        {vOpt ? <div style={{ height: virtualRange.padTop }} /> : null}

        {(visibleRows ?? []).map((row: T, ri: number) => {
          const realIndex = vOpt ? virtualRange.start + ri : ri
          const keyCandidate =
            (row as any)?.id ?? (row as any)?.key ?? (row as any)?._id ?? (row as any)?.rowId
          const rowKey =
            keyCandidate !== undefined && keyCandidate !== null
              ? String(keyCandidate)
              : `${tableKey}_${realIndex}`

          return (
            <TableRow<T>
              key={`${tableKey}_row_${rowKey}`}
              tableKey={tableKey}
              index={realIndex}
              data={row as any}
              columnConfig={columnConfig}
              columns={gridColumns}
              rowHeight={vOpt?.rowHeight}
              onRowClick={onRowClick}
              rowActions={rowActions as any}
              disabled={disabled}
            />
          )
        })}

        {vOpt ? <div style={{ height: virtualRange.padBottom }} /> : null}

        {hasMore && loading ? (
          <TableTr columns={gridColumns} disabled={disabled}>
            <TableTd colSpan={colSpanAll} align="center" disabled={disabled}>
              <Progress type="Circular" variant="indeterminate" />
            </TableTd>
          </TableTr>
        ) : null}

        {hasMore ? <div ref={bottomRef} style={{ height: 1 }} /> : null}
      </>
    )
  }

  const safeTotalCount = useMemo(() => {
    if (typeof totalCount === "number") return Math.max(0, Number(totalCount) || 0)
    return Math.max(0, Number(data?.length ?? 0) || 0)
  }, [totalCount, data?.length])

  return (
    <>
      {shouldRenderToolbar ? (
        <TableToolBar
          {...(toolbar as TableToolBarProps)}
          disabled={disabled}
          title={toolbar?.title}
          searchValue={String(query.keyword ?? "")}
          onSearchChange={(v) => emitQuery({ keyword: v })}
          exportEnabled={exportEnabled}
          exportItems={exportItems}
          excludeExportTypes={excludeExportTypes}
          onExport={onExport ? (type: any) => handleExport(type) : undefined}
          exportContext={exportContext}
        />
      ) : null}

      <TableContainer {...baseProps}>
        <Flex
          direction="column"
          height={height}
          width={"100%"}
          sx={{
            minHeight: 0,
            background: theme.colors.grayscale.white,
          }}
        >
          {renderHeader()}

          <Box
            ref={bodyScrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <Box sx={{ paddingBottom: hasMore ? "80px" : "0px" }}>
              {renderBodyRowsOnly()}

              {summaryEnabled ? (
                <TableSummaryRow
                  tableKey={tableKey}
                  columns={columnConfig as any}
                  rows={[] as any}
                  config={summaryRow as SummaryRowProps<T>}
                  disabled={disabled}
                  gridColumns={gridColumns}
                  stickyBottom
                  rowHeight={summaryRowHeight}
                />
              ) : null}
            </Box>
          </Box>
        </Flex>
      </TableContainer>

      <Flex
        align="center"
        justify="flex-start"
        mt={2}
        p={"6px 8px"}
        bgColor={theme.colors.grayscale.white}
        sx={{
          position: "relative",
          borderRadius: theme.borderRadius[4],
          border: `1px solid ${theme.colors.border.default}`,
        }}
      >
        <TableTotalRows totalRows={safeTotalCount} />
      </Flex>
    </>
  )
}

export default InfiniteTable
