// Table.tsx (컨트롤러 훅으로 “서버 완전 제어형 파이프라인” + 리사이즈 RAF + 안정적인 key)
import { JSX, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import Pagination from "../Pagination/Pagination"
import { Typography } from "../Typography/Typography"
import { SortDirection, TableProps } from "./@Types/table"
import TableContainer from "./_internal/TableContainer"
import TableHead from "./_internal/TableHead"
import TableRow from "./_internal/TableRow"
import TableTd from "./_internal/TableTd"
import TableTh from "./_internal/TableTh"
import TableTr from "./_internal/TableTr"
import Flex from "../Flex/Flex"
import ScrollBox from "../ScrollBox/ScrollBox"
import { renderCell } from "./_internal/TableCell"
import TableTotalRows from "./_internal/TableTotalRows"
import TableRowsPerPage from "./_internal/TableRowsPerPage"
import TableSummaryRow from "./_internal/TableSummaryRow"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"
import { ExportType } from "./_internal/TableExport"
import TableToolBar from "./_internal/TableToolBar"
import { useTableController } from "./@Types/useTableController"

const parseWidthToPx = (w?: string) => {
  if (!w) return undefined
  const s = String(w).trim()
  if (s.endsWith("px")) return Number(s.replace("px", ""))
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

const escapeCsv = (s: string) => {
  const v = s ?? ""
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

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

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const Table = <T extends Record<string, unknown>>({
  tableKey,
  tableConfig,
  columnConfig,
  data = [],
  pagination,
  emptyRowText,
  innerRef,
  sticky = true,
  height = 300,
  renderRow,
  customTableHeader,
  onPageChange,
  onRowsPerPageChange,
  disabled = false,
  totalRows = true,
  rowsPer = true,
  summaryRow,

  mode = "client",

  // search
  searchEnabled = false,
  searchPlaceholder,
  searchKeys,
  keyword: controlledKeyword,
  onKeywordChange,
  onQueryChange,

  // export
  exportEnabled = false,
  exportScope = "all",
  onExport,

  ...baseProps
}: TableProps<T> & {
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  disabled?: boolean
  height?: number
  footer?: React.ReactNode
  totalRows?: boolean
  rowsPer?: boolean
}): JSX.Element => {
  const [insertRowActive, setInsertRowActive] = useState(false)

  useImperativeHandle(innerRef, () => ({
    insertRow: () => setInsertRowActive(true),
    saveData: () => setInsertRowActive(false),
  }))

  const columnKeysForSearch = useMemo(() => {
    const keys: (keyof T)[] = searchKeys?.length
      ? (searchKeys as (keyof T)[])
      : (columnConfig
          .map((c) => c.key)
          .filter((k): k is keyof T => k !== ("custom" as any)) as (keyof T)[])
    return keys
  }, [searchKeys, columnConfig])

  const ctl = useTableController<T>({
    mode: mode as any,
    disabled,

    data: data ?? [],
    columnKeysForSearch,

    tableConfig: tableConfig as any,

    onPageChange,
    onRowsPerPageChange,

    controlledKeyword,
    onKeywordChange,

    onQueryChange: onQueryChange as any,
    searchDebounceMs: 300,
  })

  // ---- column widths (grid) + drag resize (RAF) ----
  const [colPx, setColPx] = useState<number[]>(() =>
    columnConfig.map((c) => parseWidthToPx(c.width) ?? 160),
  )

  useEffect(() => {
    setColPx((prev) => {
      if (prev.length === columnConfig.length) return prev
      return columnConfig.map((c, i) => prev[i] ?? parseWidthToPx(c.width) ?? 160)
    })
  }, [columnConfig])

  const dragRef = useRef<{ active: boolean; colIndex: number; startX: number; startW: number }>({
    active: false,
    colIndex: -1,
    startX: 0,
    startW: 0,
  })

  const rafRef = useRef<number | null>(null)
  const pendingWidthRef = useRef<{ colIndex: number; width: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const nextW = clamp(dragRef.current.startW + dx, 60, 2000)

      pendingWidthRef.current = { colIndex: dragRef.current.colIndex, width: nextW }
      if (rafRef.current !== null) return

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        const pending = pendingWidthRef.current
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
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  const gridColumns = useMemo(() => colPx.map((w) => `${w}px`).join(" "), [colPx])

  const startResize = (colIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { active: true, colIndex, startX: e.clientX, startW: colPx[colIndex] ?? 160 }
  }

  const getSortValue = (
    colSort?: boolean,
    colSortDirection?: SortDirection,
  ): SortDirection | undefined => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

  const getRowKey = (row: T, index: number) => {
    const anyRow: any = row as any
    const candidate = anyRow?.id ?? anyRow?.key ?? anyRow?._id ?? anyRow?.rowId
    return candidate !== undefined && candidate !== null
      ? String(candidate)
      : `${tableKey}_${index}`
  }

  // ----- export: server 우선(제어형), client fallback은 유지하되 “대규모”면 사용처에서 onExport 권장 -----
  const doExportClientCsv = (scope: "page" | "all") => {
    const rowsForExport = scope === "page" ? ctl.pageRows : ctl.filteredRows
    const cols = columnConfig.filter((c) => c.key !== ("custom" as any))

    const header = cols.map((c) => escapeCsv(String(c.title ?? ""))).join(",")
    const lines = rowsForExport.map((row) =>
      cols
        .map((c) => {
          const v = row[c.key as keyof T]
          return escapeCsv(toCellText(v))
        })
        .join(","),
    )

    const csv = [header, ...lines].join("\r\n")
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${tableKey}.csv`)
  }

  const handleExport = (type: ExportType) => {
    if (!exportEnabled || disabled) return

    const scope = exportScope ?? "all"
    const payload = {
      scope,
      keyword: ctl.keyword ?? "",
      page: ctl.page,
      rowsPerPage: ctl.rowsPerPage,
    }

    if (mode === "server") {
      onExport?.(type, payload as any)
      return
    }

    if (onExport) {
      onExport(type, payload as any)
      return
    }

    if (type === "csv") doExportClientCsv(scope)
  }

  const renderHead = () => (
    <TableHead sticky={sticky} top={"0px"}>
      {customTableHeader?.length ? null : null}
      <TableTr columns={gridColumns} disabled={disabled}>
        {columnConfig.map((col, idx) => {
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
      </TableTr>
    </TableHead>
  )

  const renderSummaryRows = () => {
    if (!summaryRow?.enabled) return null
    return (
      <TableSummaryRow
        tableKey={tableKey}
        columns={columnConfig}
        rows={mode === "server" ? [] : ctl.filteredRows}
        config={summaryRow as any}
        disabled={disabled}
        gridColumns={gridColumns}
      />
    )
  }

  const renderBody = () => {
    if (ctl.pageRows.length === 0) {
      return (
        <>
          <TableTr columns={gridColumns} disabled={disabled}>
            <TableTd colSpan={columnConfig.length} align="center" disabled={disabled}>
              <Typography
                text={emptyRowText ?? "검색 결과가 없습니다."}
                align="center"
                sx={{ display: "inline-block" }}
              />
            </TableTd>
          </TableTr>
          {renderSummaryRows()}
        </>
      )
    }

    return (
      <>
        {ctl.pageRows.map((row, ri) =>
          renderRow ? (
            renderRow(row, ri)
          ) : (
            <TableRow
              key={`${tableKey}_row_${getRowKey(row, ri)}`}
              columnConfig={columnConfig}
              data={row}
              index={ri}
              tableKey={tableKey}
              disabled={disabled}
              columns={gridColumns}
            />
          ),
        )}

        {insertRowActive && (
          <TableTr columns={gridColumns} disabled={disabled}>
            {columnConfig.map((col, ci) => (
              <TableTd key={`${tableKey}_insert_${ci}`} disabled>
                {renderCell(col, {} as T, -1, true)}
              </TableTd>
            ))}
          </TableTr>
        )}

        {renderSummaryRows()}
      </>
    )
  }

  const paginationLabel = useMemo(
    () => `${ctl.fromTo.from}–${ctl.fromTo.to} of ${ctl.totalCount}`,
    [ctl.fromTo.from, ctl.fromTo.to, ctl.totalCount],
  )

  return (
    <>
      {(searchEnabled || exportEnabled) && (
        <TableToolBar
          disabled={disabled}
          searchEnabled={searchEnabled}
          searchValue={ctl.keyword}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={ctl.setKeyword}
          exportEnabled={exportEnabled}
          onExport={handleExport as any}
        />
      )}

      <TableContainer {...baseProps}>
        <ScrollBox maxHeight={height}>
          {renderHead()}
          <Box>{renderBody()}</Box>
        </ScrollBox>
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
          {rowsPer && (
            <TableRowsPerPage
              rowsPerPage={ctl.rowsPerPage}
              rowsPerPageOptions={ctl.rowsPerPageOptions}
              onRowsPerPageChange={ctl.setRowsPerPage}
              disabled={disabled}
            />
          )}
          {totalRows && <TableTotalRows ml={4} totalRows={ctl.totalCount} />}
        </Flex>

        {pagination && (
          <Pagination
            type={pagination as any}
            disabled={disabled}
            count={ctl.totalCount}
            page={ctl.page}
            pageCount={ctl.pageCount}
            onPageChange={ctl.setPage}
            labelDisplayedRows={() => paginationLabel}
            showPrevNextButtons
            showFirstLastButtons
          />
        )}
      </Flex>
    </>
  )
}

export default Table
