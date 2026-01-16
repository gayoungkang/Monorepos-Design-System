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
import TableRowsPerPage from "./TableRowsPerPage"
import TableSummaryRow from "./_internal/TableSummaryRow"
import TableToolbar, { ExportType } from "./_internal/TableToolbar"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"

const parseWidthToPx = (w?: string) => {
  if (!w) return undefined
  const s = String(w).trim()
  if (s.endsWith("px")) return Number(s.replace("px", ""))
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

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

const escapeCsv = (s: string) => {
  const v = s ?? ""
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
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

  const rowsPerPageValue = useMemo(() => {
    const rp = isControlledRowsPerPage ? (tableConfig?.rowsPerPage as number) : internalRowsPerPage
    return Math.max(1, rp || rowsPerPageOptions[0] || 10)
  }, [isControlledRowsPerPage, tableConfig?.rowsPerPage, internalRowsPerPage, rowsPerPageOptions])

  const page = useMemo(() => {
    const p = isControlledPage ? (tableConfig?.page as number) : internalPage
    return Math.max(1, p || 1)
  }, [isControlledPage, tableConfig?.page, internalPage])

  // ----- search state -----
  const [internalKeyword, setInternalKeyword] = useState("")
  const keyword = controlledKeyword ?? internalKeyword

  const handleKeywordChange = (next: string) => {
    if (disabled) return
    onKeywordChange?.(next)
    if (controlledKeyword === undefined) setInternalKeyword(next)

    if (mode === "server") {
      onQueryChange?.({
        page: 1,
        rowsPerPage: rowsPerPageValue,
        keyword: next,
      })
      if (!isControlledPage) setInternalPage(1)
      onPageChange?.(1)
    }
  }

  // Table/Table.tsx (filteredRows useMemo 부분만 교체)
  const filteredRows = useMemo(() => {
    if (mode !== "client") return data

    const q = (keyword ?? "").trim().toLowerCase()
    if (!q) return data

    const keys: (keyof T)[] = searchKeys?.length
      ? (searchKeys as (keyof T)[])
      : (columnConfig
          .map((c) => c.key)
          .filter((k): k is keyof T => k !== ("custom" as any)) as (keyof T)[])

    return (data ?? []).filter((row) => {
      return keys.some((k) => {
        const txt = toCellText(row[k]).toLowerCase()
        return txt.includes(q)
      })
    })
  }, [mode, data, keyword, searchKeys, columnConfig])

  const totalCount = useMemo(() => {
    if (mode === "server") return Math.max(0, tableConfig?.totalCount ?? 0)
    return Math.max(0, filteredRows.length ?? 0)
  }, [mode, tableConfig?.totalCount, filteredRows.length])

  const pageCount = useMemo(() => {
    if (totalCount <= 0) return 1
    return Math.max(1, Math.ceil(totalCount / rowsPerPageValue))
  }, [totalCount, rowsPerPageValue])

  const safePage = useMemo(() => clamp(page, 1, pageCount), [page, pageCount])

  useEffect(() => {
    const next = clamp(safePage, 1, pageCount)
    if (next !== safePage) {
      if (onPageChange) onPageChange(next)
      else setInternalPage(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount])

  const fromTo = useMemo(() => {
    if (totalCount <= 0) return { from: 0, to: 0 }
    const from = (safePage - 1) * rowsPerPageValue + 1
    const to = Math.min(totalCount, safePage * rowsPerPageValue)
    return { from, to }
  }, [totalCount, safePage, rowsPerPageValue])

  const pageRows = useMemo(() => {
    if (mode === "server") return data
    const start = (safePage - 1) * rowsPerPageValue
    const end = start + rowsPerPageValue
    return filteredRows.slice(start, end)
  }, [mode, data, filteredRows, safePage, rowsPerPageValue])

  const getSortValue = (
    colSort?: boolean,
    colSortDirection?: SortDirection,
  ): SortDirection | undefined => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

  // ---- column widths (grid) + drag resize ----
  const [colPx, setColPx] = useState<number[]>(() => {
    const initial = columnConfig.map((c) => parseWidthToPx(c.width) ?? 160)
    return initial
  })

  useEffect(() => {
    setColPx((prev) => {
      if (prev.length === columnConfig.length) return prev
      const next = columnConfig.map((c, i) => prev[i] ?? parseWidthToPx(c.width) ?? 160)
      return next
    })
  }, [columnConfig])

  const dragRef = useRef<{
    active: boolean
    colIndex: number
    startX: number
    startW: number
  }>({ active: false, colIndex: -1, startX: 0, startW: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const nextW = clamp(dragRef.current.startW + dx, 60, 2000)

      setColPx((prev) => {
        const next = [...prev]
        next[dragRef.current.colIndex] = nextW
        return next
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
    }
  }, [])

  const gridColumns = useMemo(() => colPx.map((w) => `${w}px`).join(" "), [colPx])

  const startResize = (colIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      active: true,
      colIndex,
      startX: e.clientX,
      startW: colPx[colIndex] ?? 160,
    }
  }

  // ----- query change hook (server mode) -----
  useEffect(() => {
    if (mode !== "server") return
    onQueryChange?.({
      page: safePage,
      rowsPerPage: rowsPerPageValue,
      keyword: keyword ?? "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, safePage, rowsPerPageValue])

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    if (disabled) return

    tableConfig?.handleOnRowsPerPageChange?.({ target: { value: nextRowsPerPage } as any } as any)
    onRowsPerPageChange?.(nextRowsPerPage)

    if (!isControlledRowsPerPage) setInternalRowsPerPage(nextRowsPerPage)

    const nextPage = 1
    if (!isControlledPage) setInternalPage(nextPage)
    onPageChange?.(nextPage)

    if (mode === "server") {
      onQueryChange?.({
        page: nextPage,
        rowsPerPage: nextRowsPerPage,
        keyword: keyword ?? "",
      })
    }
  }

  const handlePageChange = (nextPage: number) => {
    if (disabled) return

    const safeNext = clamp(nextPage, 1, pageCount)
    onPageChange?.(safeNext)
    if (!isControlledPage) setInternalPage(safeNext)

    if (mode === "server") {
      onQueryChange?.({
        page: safeNext,
        rowsPerPage: rowsPerPageValue,
        keyword: keyword ?? "",
      })
    }
  }

  // ----- export (client/server) -----
  const doExportClientCsv = (scope: "page" | "all") => {
    const rowsForExport = scope === "page" ? pageRows : filteredRows
    const cols = columnConfig.filter((c) => c.key !== ("custom" as any))

    const header = cols.map((c) => escapeCsv(String(c.title ?? ""))).join(",")
    const lines = rowsForExport.map((row) => {
      return cols
        .map((c) => {
          const v = row[c.key as keyof T]
          return escapeCsv(toCellText(v))
        })
        .join(",")
    })

    const csv = [header, ...lines].join("\r\n")
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${tableKey}.csv`)
  }

  const doExportClientPrint = (scope: "page" | "all") => {
    const rowsForExport = scope === "page" ? pageRows : filteredRows
    const cols = columnConfig.filter((c) => c.key !== ("custom" as any))

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${tableKey}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 12px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background: #f5f5f5; text-align: left; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${cols.map((c) => `<th>${String(c.title ?? "")}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowsForExport
                .map(
                  (r) =>
                    `<tr>${cols
                      .map((c) => `<td>${toCellText(r[c.key as keyof T])}</td>`)
                      .join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `

    const w = window.open("", "_blank", "noopener,noreferrer")
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  const handleExport = (type: ExportType) => {
    if (!exportEnabled || disabled) return

    const scope = exportScope ?? "all"
    const payload = { scope, keyword: keyword ?? "" }

    if (mode === "server") {
      onExport?.(type, payload)
      return
    }

    if (onExport) {
      onExport(type, payload)
      return
    }

    if (type === "csv") doExportClientCsv(scope)
    if (type === "print") doExportClientPrint(scope)
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
        rows={mode === "client" ? filteredRows : data}
        config={summaryRow}
        disabled={disabled}
        gridColumns={gridColumns}
      />
    )
  }

  const renderBody = () => {
    if (pageRows.length === 0) {
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
        {pageRows.map((row, ri) =>
          renderRow ? (
            renderRow(row, ri)
          ) : (
            <TableRow
              key={`${tableKey}_row_${ri}`}
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
    () => `${fromTo.from}–${fromTo.to} of ${totalCount}`,
    [fromTo.from, fromTo.to, totalCount],
  )

  return (
    <>
      {(searchEnabled || exportEnabled) && (
        <TableToolbar
          disabled={disabled}
          searchEnabled={searchEnabled}
          searchValue={keyword}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={handleKeywordChange}
          exportEnabled={exportEnabled}
          onExport={handleExport}
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
              rowsPerPage={rowsPerPageValue}
              rowsPerPageOptions={rowsPerPageOptions}
              onRowsPerPageChange={handleRowsPerPageChange}
              disabled={disabled}
            />
          )}
          {totalRows && <TableTotalRows ml={4} totalRows={totalCount} />}
        </Flex>

        {pagination && (
          <Pagination
            type={pagination as any}
            disabled={disabled}
            count={totalCount}
            page={safePage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
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
