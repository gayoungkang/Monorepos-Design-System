import type { Meta, StoryObj } from "@storybook/react"
import { useEffect, useMemo, useState } from "react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Table from "./Table"
import type {
  TableProps,
  SortDirection,
  ColumnProps,
  ColumnOnChangeType,
  TableMode,
  TableQuery,
} from "./@Types/table"
import TableToolbar from "./_internal/TableToolbar"

import Select from "../Select/Select"
import TextField from "../TextField/TextField"
import IconButton from "../IconButton/IconButton"
import Button from "../Button/Button"
import Divider from "../Divider/Divider"
import { ExportItem, ExportType } from "./_internal/TableExport"

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type PersonRow = {
  id: string
  name: string
  role: string
  email: string
  active: boolean
  qty: number
  price: number
}

type FilterOperator = "contains" | "startsWith" | "endsWith" | "equals"

type FilterItem = {
  id: string
  columnKey?: string
  operator?: FilterOperator
  value?: string
}

/* -------------------------------------------------------------------------- */
/*                                 Mock Data                                  */
/* -------------------------------------------------------------------------- */

const makeRows = (): PersonRow[] => [
  {
    id: "U-001",
    name: "Alice",
    role: "Admin",
    email: "alice@demo.com",
    active: true,
    qty: 3,
    price: 12000,
  },
  {
    id: "U-002",
    name: "Bob",
    role: "Editor",
    email: "bob@demo.com",
    active: false,
    qty: 2,
    price: 8000,
  },
  {
    id: "U-003",
    name: "Chris",
    role: "Viewer",
    email: "chris@demo.com",
    active: true,
    qty: 8,
    price: 15000,
  },
  {
    id: "U-004",
    name: "Daisy",
    role: "Editor",
    email: "daisy@demo.com",
    active: true,
    qty: 5,
    price: 10000,
  },
  {
    id: "U-005",
    name: "Evan",
    role: "Viewer",
    email: "evan@demo.com",
    active: false,
    qty: 1,
    price: 4000,
  },
  {
    id: "U-006",
    name: "Fiona",
    role: "Admin",
    email: "fiona@demo.com",
    active: true,
    qty: 6,
    price: 22000,
  },
  {
    id: "U-007",
    name: "Gabe",
    role: "Editor",
    email: "gabe@demo.com",
    active: true,
    qty: 4,
    price: 9000,
  },
  {
    id: "U-008",
    name: "Hana",
    role: "Viewer",
    email: "hana@demo.com",
    active: false,
    qty: 7,
    price: 18000,
  },
  {
    id: "U-009",
    name: "Ian",
    role: "Editor",
    email: "ian@demo.com",
    active: true,
    qty: 9,
    price: 3000,
  },
  {
    id: "U-010",
    name: "Jane",
    role: "Admin",
    email: "jane@demo.com",
    active: true,
    qty: 2,
    price: 7000,
  },
  {
    id: "U-011",
    name: "Kyle",
    role: "Viewer",
    email: "kyle@demo.com",
    active: false,
    qty: 11,
    price: 5000,
  },
  {
    id: "U-012",
    name: "Lia",
    role: "Editor",
    email: "lia@demo.com",
    active: true,
    qty: 3,
    price: 6000,
  },
  {
    id: "U-013",
    name: "Mina",
    role: "Viewer",
    email: "mina@demo.com",
    active: true,
    qty: 4,
    price: 12000,
  },
  {
    id: "U-014",
    name: "Noah",
    role: "Admin",
    email: "noah@demo.com",
    active: false,
    qty: 10,
    price: 20000,
  },
  {
    id: "U-015",
    name: "Owen",
    role: "Editor",
    email: "owen@demo.com",
    active: true,
    qty: 1,
    price: 11000,
  },
]

/* -------------------------------------------------------------------------- */
/*                                   Utils                                    */
/* -------------------------------------------------------------------------- */

const sortRows = (rows: PersonRow[], key: keyof PersonRow, dir: SortDirection) => {
  const copy = [...rows]
  copy.sort((a, b) => {
    const av = a[key] as any
    const bv = b[key] as any
    const as = typeof av === "string" ? av : String(av ?? "")
    const bs = typeof bv === "string" ? bv : String(bv ?? "")
    if (as < bs) return dir === "ASC" ? -1 : 1
    if (as > bs) return dir === "ASC" ? 1 : -1
    return 0
  })
  return copy
}

const paginate = (rows: PersonRow[], page: number, rowsPerPage: number) => {
  const start = (page - 1) * rowsPerPage
  return rows.slice(start, start + rowsPerPage)
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

const escapeCsv = (s: string) => {
  const v = s ?? ""
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
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

const makeId = () => `f_${Math.random().toString(36).slice(2, 10)}`

const applyOperator = (hay: string, needle: string, op: FilterOperator) => {
  const h = hay.toLowerCase()
  const n = needle.toLowerCase()
  if (!n) return true
  if (op === "equals") return h === n
  if (op === "startsWith") return h.startsWith(n)
  if (op === "endsWith") return h.endsWith(n)
  return h.includes(n)
}

const applyFilters = (rows: PersonRow[], filters: FilterItem[]) => {
  const actives = (filters ?? []).filter((f) => (f.value ?? "").trim().length > 0 && f.columnKey)
  if (!actives.length) return rows

  return rows.filter((r) => {
    for (const f of actives) {
      const key = f.columnKey as keyof PersonRow
      const op = (f.operator ?? "contains") as FilterOperator
      const val = (f.value ?? "").trim()
      const cell = toCellText(r[key])
      if (!applyOperator(cell, val, op)) return false
    }
    return true
  })
}

/* -------------------------------------------------------------------------- */
/*                          Interactive Wrapper (핵심)                        */
/* -------------------------------------------------------------------------- */

type TableStoryExtraProps = {
  disabled?: boolean
  summaryEnabled?: boolean
  summarySticky?: boolean
  summaryMultiRow?: boolean
  paginationType?: "Table" | "Basic"
  stickyHeader?: boolean

  mode?: TableMode
  searchEnabled?: boolean
  exportEnabled?: boolean
  exportScope?: "page" | "all"

  columnVisibilityEnabled?: boolean
  filterEnabled?: boolean

  // * NEW: export 확장/제외 테스트용
  exportExcludePrint?: boolean
  exportExtraEnabled?: boolean
}

const TableInteractive = (props: TableProps<PersonRow> & TableStoryExtraProps) => {
  const [allRows, setAllRows] = useState<PersonRow[]>(makeRows())

  const [page, setPage] = useState<number>(props.tableConfig?.page ?? 1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(props.tableConfig?.rowsPerPage ?? 5)

  const [sortKey, setSortKey] = useState<keyof PersonRow | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("ASC")

  const [keyword, setKeyword] = useState<string>("")

  const [visibleKeys, setVisibleKeys] = useState<string[]>([])

  const [filters, setFilters] = useState<FilterItem[]>([
    { id: makeId(), columnKey: "name", operator: "contains", value: "" },
  ])
  const [filterOpen, setFilterOpen] = useState(false)

  const [serverRows, setServerRows] = useState<PersonRow[]>([])
  const [serverTotal, setServerTotal] = useState<number>(0)

  const mode: TableMode = props.mode ?? "client"

  const sorted = useMemo(() => {
    if (!sortKey) return allRows
    return sortRows(allRows, sortKey, sortDirection)
  }, [allRows, sortKey, sortDirection])

  const filteredByKeyword = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return sorted
    return sorted.filter((r) => {
      const hay = [r.id, r.name, r.role, r.email, r.active, r.qty, r.price]
        .map((v) => toCellText(v).toLowerCase())
        .join(" ")
      return hay.includes(kw)
    })
  }, [sorted, keyword])

  const filteredAll = useMemo(
    () => applyFilters(filteredByKeyword, filters),
    [filteredByKeyword, filters],
  )

  const onCellChange = (c: ColumnOnChangeType<PersonRow>) => {
    if (props.disabled) return

    if (c.type === "TextField") {
      setAllRows((prev) =>
        prev.map((r, i) => (i === c.rowIndex ? { ...r, [c.key]: String(c.changeValue) } : r)),
      )
      return
    }

    if (c.type === "CheckBox") {
      setAllRows((prev) =>
        prev.map((r, i) => (i === c.rowIndex ? { ...r, [c.key]: Boolean(c.changeValue) } : r)),
      )
    }
  }

  const baseColumnConfig: ColumnProps<PersonRow>[] = useMemo(() => {
    const isDisabled = Boolean(props.disabled)

    return [
      {
        key: "id",
        title: "ID (sort)",
        type: "Default",
        width: "110px",
        textAlign: "left",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "id" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
      },
      {
        key: "name",
        title: "Name (TextField)",
        type: "TextField",
        textAlign: "left",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "name" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
        onChange: onCellChange,
      },
      {
        key: "role",
        title: "Role (sort)",
        type: "Default",
        width: "120px",
        textAlign: "left",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "role" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
      },
      {
        key: "email",
        title: "Email (sort)",
        type: "Default",
        width: "200px",
        textAlign: "left",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "email" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
      },
      {
        key: "active",
        title: "Active (CheckBox)",
        type: "CheckBox",
        width: "140px",
        textAlign: "center",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "active" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
        onChange: onCellChange,
      },
      {
        key: "qty",
        title: "Qty (sum)",
        type: "Default",
        width: "100px",
        textAlign: "right",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "qty" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
      },
      {
        key: "price",
        title: "Price (sum)",
        type: "Default",
        width: "120px",
        textAlign: "right",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "price" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
      },
      {
        key: "custom",
        title: "Link (onClick)",
        type: "Default",
        width: "120px",
        textAlign: "center",
        onClick: isDisabled
          ? undefined
          : (row, idx) => {
              console.log("Cell onClick:", { row, idx })
            },
        renderCellTitle: "Open",
      },
    ]
  }, [props.disabled, sortKey, sortDirection])

  const toolbarColumns = useMemo(
    () =>
      baseColumnConfig
        .filter((c) => c.key !== "custom")
        .map((c) => ({ key: String(c.key), title: String(c.title ?? ""), hideable: true })),
    [baseColumnConfig],
  )

  const defaultVisibleKeys = useMemo(() => toolbarColumns.map((c) => c.key), [toolbarColumns])

  useEffect(() => {
    if (!visibleKeys.length) setVisibleKeys(defaultVisibleKeys)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultVisibleKeys.join("|")])

  const columnConfig = useMemo(() => {
    const enabled = props.columnVisibilityEnabled !== false
    if (!enabled) return baseColumnConfig

    const v = new Set(visibleKeys.length ? visibleKeys : defaultVisibleKeys)
    return baseColumnConfig.filter((c) => c.key === "custom" || v.has(String(c.key)))
  }, [props.columnVisibilityEnabled, baseColumnConfig, visibleKeys, defaultVisibleKeys])

  const runServerQuery = (q: TableQuery) => {
    const base = sorted

    const kw = (q.keyword ?? "").trim().toLowerCase()
    const kwFiltered = !kw
      ? base
      : base.filter((r) => {
          const hay = [r.id, r.name, r.role, r.email, r.active, r.qty, r.price]
            .map((v) => toCellText(v).toLowerCase())
            .join(" ")
          return hay.includes(kw)
        })

    const filtered = applyFilters(kwFiltered, filters)
    const total = filtered.length
    const pageRows = paginate(filtered, q.page, q.rowsPerPage)

    setServerTotal(total)
    setServerRows(pageRows)
  }

  useEffect(() => {
    if (mode !== "server") return
    runServerQuery({
      page,
      rowsPerPage,
      keyword,
      sortKey: sortKey ? String(sortKey) : undefined,
      sortDirection,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  useEffect(() => {
    if (mode !== "server") return
    setPage(1)
    runServerQuery({
      page: 1,
      rowsPerPage,
      keyword,
      sortKey: sortKey ? String(sortKey) : undefined,
      sortDirection,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const showSummary = Boolean(props.summaryEnabled)
  const stickySummary = props.summarySticky !== false
  const multiRow = Boolean(props.summaryMultiRow)

  const summaryRow = useMemo(() => {
    if (!showSummary) return undefined as any

    const numberFmt = (v: number) => new Intl.NumberFormat().format(v)
    const priceFmt = (v: number) => `${new Intl.NumberFormat().format(v)}원`

    const avgBase = mode === "server" ? serverRows : paginate(filteredAll, page, rowsPerPage)

    return {
      enabled: true,
      sticky: stickySummary,
      rows: multiRow
        ? [
            {
              label: "SUM",
              labelColumnKey: "role",
              items: [
                { key: "qty", formatter: numberFmt },
                { key: "price", formatter: priceFmt },
              ],
            },
            {
              label: "AVG",
              labelColumnKey: "role",
              items: [
                {
                  key: "qty",
                  formatter: (sum: number) => {
                    const avg = avgBase.length ? sum / avgBase.length : 0
                    return avg.toFixed(1)
                  },
                },
                {
                  key: "price",
                  formatter: (sum: number) => {
                    const avg = avgBase.length ? sum / avgBase.length : 0
                    return `${Math.round(avg).toLocaleString()}원`
                  },
                },
              ],
            },
          ]
        : [
            {
              label: "SUM",
              labelColumnKey: "role",
              items: [
                { key: "qty", formatter: numberFmt },
                { key: "price", formatter: priceFmt },
              ],
            },
          ],
    }
  }, [showSummary, stickySummary, multiRow, mode, serverRows, filteredAll, page, rowsPerPage])

  const pagination = props.paginationType

  // * NEW: ExportType 확장 (Story에서만 "json" 추가)
  type ExtraExport = "json"
  const extraExportEnabled = Boolean(props.exportExtraEnabled)

  const exportExclude = useMemo(() => {
    const base: ExportType<ExtraExport>[] = []
    if (props.exportExcludePrint) base.push("print")
    return base
  }, [props.exportExcludePrint])

  const exportItems: ExportItem<ExportType<ExtraExport>>[] = useMemo(() => {
    if (!extraExportEnabled) return []
    return [{ type: "json", label: "JSON 다운로드" }]
  }, [extraExportEnabled])

  const handleExport = (
    type: ExportType<ExtraExport>,
    payload: { scope: "page" | "all"; keyword: string },
  ) => {
    if (props.disabled) return

    if (mode === "server") {
      // * 서버 모드는 "요청만" 확인(실제 다운로드는 서버 응답으로 처리하는 케이스)
      console.log("[SERVER EXPORT]", {
        type,
        payload,
        filters,
        sortKey,
        sortDirection,
        page,
        rowsPerPage,
      })
      return
    }

    const scope = payload.scope
    const rowsForExport = scope === "page" ? paginate(filteredAll, page, rowsPerPage) : filteredAll
    const cols = baseColumnConfig.filter((c) => c.key !== ("custom" as any))

    if (type === "csv" || type === "excel") {
      const header = cols.map((c) => escapeCsv(String(c.title ?? ""))).join(",")
      const lines = rowsForExport.map((row) =>
        cols.map((c) => escapeCsv(toCellText(row[c.key as keyof PersonRow]))).join(","),
      )
      const csv = [header, ...lines].join("\r\n")
      downloadBlob(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
        type === "excel" ? "demo-table.xls" : "demo-table.csv",
      )
      return
    }

    if (type === "pdf") {
      // * 데모: 실제 PDF 생성은 서버/라이브러리로 대체될 수 있음
      console.log("[CLIENT PDF]", { rows: rowsForExport.length })
      const text = `PDF DEMO\nrows=${rowsForExport.length}\nkeyword=${payload.keyword}\nfilters=${filters.length}`
      downloadBlob(new Blob([text], { type: "application/pdf" }), "demo-table.pdf")
      return
    }

    if (type === "print") {
      console.log("[CLIENT PRINT]", { rows: rowsForExport.length })
      window.print()
      return
    }

    if (type === "json") {
      const json = JSON.stringify(rowsForExport, null, 2)
      downloadBlob(new Blob([json], { type: "application/json" }), "demo-table.json")
    }
  }

  const handleFilterChange = (next: FilterItem[]) => {
    if (props.disabled) return
    setFilters(next)
    setPage(1)
  }

  const filterActiveCount = useMemo(
    () => (filters ?? []).filter((f) => (f.value ?? "").trim().length > 0).length,
    [filters],
  )

  const filterColumnOptions = useMemo(
    () => toolbarColumns.map((c) => ({ value: c.key, label: c.title })),
    [toolbarColumns],
  )

  const operatorOptions = useMemo(
    () => [
      { value: "startsWith", label: "startsWith" },
      { value: "contains", label: "contains" },
      { value: "endsWith", label: "endsWith" },
      { value: "equals", label: "equals" },
    ],
    [],
  )

  // * NEW: filterContent (외부 렌더링) + 외부 onFilterSearch/onFilterReset 시뮬레이션
  const filterContent = useMemo(() => {
    return (
      <Flex direction="column" gap={10}>
        {(filters ?? []).map((f) => (
          <Flex align="center" justify="flex-start" gap={10} key={f.id}>
            <IconButton
              icon="CloseLine"
              toolTip="삭제"
              disableInteraction={false}
              disabled={props.disabled}
              onClick={() => {
                if (props.disabled) return
                const next = (filters ?? []).filter((x) => x.id !== f.id)
                handleFilterChange(next)
              }}
            />

            <Select
              label="Columns"
              options={filterColumnOptions as any}
              value={(f.columnKey ?? "") as any}
              onChange={(v: any) => {
                if (props.disabled) return
                const next = (filters ?? []).map((x) =>
                  x.id === f.id ? { ...x, columnKey: String(v) } : x,
                )
                handleFilterChange(next)
              }}
              placeholder="Select"
              disabled={props.disabled}
            />

            <Select
              label="Operator"
              options={operatorOptions as any}
              value={(f.operator ?? "contains") as any}
              onChange={(v: any) => {
                if (props.disabled) return
                const next = (filters ?? []).map((x) =>
                  x.id === f.id ? { ...x, operator: v as any } : x,
                )
                handleFilterChange(next)
              }}
              placeholder="contains"
              disabled={props.disabled}
            />

            <TextField
              label="Value"
              disabled={props.disabled}
              value={f.value ?? ""}
              placeholder="Filter value"
              onChange={(e) => {
                if (props.disabled) return
                const next = (filters ?? []).map((x) =>
                  x.id === f.id ? { ...x, value: e.target.value } : x,
                )
                handleFilterChange(next)
              }}
            />
          </Flex>
        ))}

        <Divider />

        <Flex align="center" justify="space-between">
          <Button
            text="필터 추가"
            variant="text"
            color="secondary"
            disabled={props.disabled}
            onClick={() => {
              if (props.disabled) return
              const firstKey = filterColumnOptions[0]?.value
              const next: FilterItem = {
                id: makeId(),
                columnKey: String(firstKey ?? ""),
                operator: "contains",
                value: "",
              }
              handleFilterChange([...(filters ?? []), next])
            }}
          />

          <Button
            text="모두 삭제"
            variant="text"
            color="secondary"
            disabled={props.disabled || !(filters ?? []).length}
            onClick={() => {
              if (props.disabled) return
              handleFilterChange([])
            }}
          />
        </Flex>
      </Flex>
    )
  }, [filters, props.disabled, filterColumnOptions, operatorOptions])

  const clientData = useMemo(() => filteredAll, [filteredAll])

  return (
    <Box width="100%" p={12}>
      <Flex direction="column" gap={8} mb={12}>
        <Typography
          variant="b2Regular"
          text={[
            `mode=${mode}`,
            `disabled=${Boolean(props.disabled)}`,
            `stickyHeader=${Boolean(props.stickyHeader)}`,
            `toolbar.search=${Boolean(props.searchEnabled)}`,
            `toolbar.export=${Boolean(props.exportEnabled)}(scope=${props.exportScope ?? "all"})`,
            `toolbar.columns=${props.columnVisibilityEnabled !== false}`,
            `toolbar.filter=${props.filterEnabled !== false}`,
            `pagination=${pagination ?? "none"}`,
            `page=${page}`,
            `rowsPerPage=${rowsPerPage}`,
            `total=${mode === "server" ? serverTotal : filteredAll.length}`,
            `sort=${sortKey ? `${String(sortKey)} ${sortDirection}` : "none"}`,
            `keyword="${keyword}"`,
            `filters(active)=${filterActiveCount}`,
            `export.excludePrint=${Boolean(props.exportExcludePrint)}`,
            `export.extra(json)=${Boolean(props.exportExtraEnabled)}`,
          ].join(" / ")}
        />
      </Flex>

      <TableToolbar<"json">
        title="Table Demo"
        disabled={props.disabled}
        searchEnabled={Boolean(props.searchEnabled)}
        searchValue={keyword}
        searchPlaceholder={mode === "server" ? "검색(서버: queryChange)" : "검색(클라: 로컬)"}
        onSearchChange={(v) => {
          if (props.disabled) return
          setKeyword(v)
          setPage(1)
          if (mode === "server") {
            runServerQuery({
              page: 1,
              rowsPerPage,
              keyword: v,
              sortKey: sortKey ? String(sortKey) : undefined,
              sortDirection,
            })
          }
        }}
        exportEnabled={Boolean(props.exportEnabled)}
        // * NEW: 기본은 excel/csv/pdf/print 모두 노출, 외부에서 exclude 가능
        excludeExportTypes={exportExclude as any}
        // * NEW: 추가 export 타입(json) 데모
        exportItems={exportItems as any}
        onExport={(t) =>
          handleExport(t as any, { scope: (props.exportScope ?? "all") as any, keyword })
        }
        columnVisibilityEnabled={props.columnVisibilityEnabled !== false}
        columns={toolbarColumns}
        visibleColumnKeys={visibleKeys}
        defaultVisibleColumnKeys={defaultVisibleKeys}
        onVisibleColumnKeysChange={(keys) => {
          if (props.disabled) return
          setVisibleKeys(keys)
        }}
        columnsSkeletonEnabled={false}
        filterEnabled={props.filterEnabled !== false}
        // * NEW: filter 외부 컨트롤
        filterOpen={filterOpen}
        onFilterOpenChange={(open) => {
          if (props.disabled) return
          setFilterOpen(open)
        }}
        filterActiveCount={filterActiveCount}
        filterDrawerVariant="flex"
        filterDrawerPlacement="top"
        filterDrawerCloseBehavior="hidden"
        filterDrawerHeight={220}
        filterSkeletonEnabled={false}
        onFilterSearch={() => {
          // * 데모: 서버 모드면 "검색" 버튼이 서버 쿼리 트리거 역할
          if (props.disabled) return
          if (mode === "server") {
            runServerQuery({
              page: 1,
              rowsPerPage,
              keyword,
              sortKey: sortKey ? String(sortKey) : undefined,
              sortDirection,
            })
          }
          console.log("[FILTER SEARCH]", { keyword, filters })
        }}
        onFilterReset={() => {
          if (props.disabled) return
          handleFilterChange([{ id: makeId(), columnKey: "name", operator: "contains", value: "" }])
          console.log("[FILTER RESET]")
        }}
        filterContent={filterContent}
      />

      <Table
        tableKey={props.tableKey}
        columnConfig={columnConfig}
        data={mode === "server" ? serverRows : clientData}
        sticky={Boolean(props.stickyHeader)}
        emptyRowText={props.emptyRowText}
        disabled={props.disabled}
        pagination={pagination as any}
        summaryRow={summaryRow}
        mode={mode}
        searchEnabled={false}
        exportEnabled={false}
        keyword={keyword}
        onKeywordChange={(next) => {
          if (props.disabled) return
          setKeyword(next)
        }}
        onQueryChange={(q) => {
          if (props.disabled) return
          setPage(q.page)
          setRowsPerPage(q.rowsPerPage)
          setKeyword(q.keyword)
          runServerQuery({
            ...q,
            sortKey: sortKey ? String(sortKey) : undefined,
            sortDirection,
          })
        }}
        tableConfig={{
          totalCount: mode === "server" ? serverTotal : filteredAll.length,
          rowsPerPageOptions: props.tableConfig?.rowsPerPageOptions ?? [5, 10, 25],
          rowsPerPage,
          page,
          handleOnRowsPerPageChange: (e: any) => {
            if (props.disabled) return
            const next = Number(e?.target?.value ?? 5)
            setRowsPerPage(next)
            setPage(1)

            if (mode === "server") {
              runServerQuery({
                page: 1,
                rowsPerPage: next,
                keyword,
                sortKey: sortKey ? String(sortKey) : undefined,
                sortDirection,
              })
            }
          },
        }}
        onPageChange={(next) => {
          if (props.disabled) return
          setPage(next)

          if (mode === "server") {
            runServerQuery({
              page: next,
              rowsPerPage,
              keyword,
              sortKey: sortKey ? String(sortKey) : undefined,
              sortDirection,
            })
          }
        }}
        onRowsPerPageChange={(next) => {
          if (props.disabled) return
          setRowsPerPage(next)
          setPage(1)

          if (mode === "server") {
            runServerQuery({
              page: 1,
              rowsPerPage: next,
              keyword,
              sortKey: sortKey ? String(sortKey) : undefined,
              sortDirection,
            })
          }
        }}
      />
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Meta 설정                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<TableProps<PersonRow> & TableStoryExtraProps> = {
  title: "components/Table",
  component: TableInteractive as any,

  args: {
    tableKey: "demo-table",
    emptyRowText: "검색 결과가 없습니다.",

    disabled: false,
    stickyHeader: true,
    paginationType: "Table",
    summaryEnabled: true,
    summarySticky: true,
    summaryMultiRow: true,

    mode: "client",
    searchEnabled: true,
    exportEnabled: true,
    exportScope: "all",

    columnVisibilityEnabled: true,
    filterEnabled: true,

    exportExcludePrint: false,
    exportExtraEnabled: true,

    data: [] as any,
    columnConfig: [] as any,
    tableConfig: {
      rowsPerPageOptions: [5, 10, 25],
      rowsPerPage: 5,
      page: 1,
      totalCount: 0,
    } as any,
  },

  argTypes: {
    tableKey: { control: "text" },
    emptyRowText: { control: "text" },

    disabled: { control: "boolean" },
    stickyHeader: { control: "boolean" },

    paginationType: { control: "radio", options: [undefined, "Table", "Basic"] },

    summaryEnabled: { control: "boolean" },
    summarySticky: { control: "boolean" },
    summaryMultiRow: { control: "boolean" },

    mode: { control: "radio", options: ["client", "server"] },
    searchEnabled: { control: "boolean" },
    exportEnabled: { control: "boolean" },
    exportScope: { control: "radio", options: ["page", "all"] },

    columnVisibilityEnabled: { control: "boolean" },
    filterEnabled: { control: "boolean" },

    exportExcludePrint: { control: "boolean", description: "export에서 print 제외" },
    exportExtraEnabled: { control: "boolean", description: "export에 json 추가" },

    data: { control: false },
    columnConfig: { control: false },
    tableConfig: { control: false },
    innerRef: { control: false },
    renderRow: { control: false },
    customTableHeader: { control: false },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<TableProps<PersonRow> & TableStoryExtraProps>

/* -------------------------------------------------------------------------- */
/*                                   Stories                                   */
/* -------------------------------------------------------------------------- */

export const AllFeatures: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
}

export const ServerMode: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: {
    mode: "server",
    searchEnabled: true,
    exportEnabled: true,
    columnVisibilityEnabled: true,
    filterEnabled: true,
    exportExcludePrint: false,
    exportExtraEnabled: true,
  },
}

export const ClientMode: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: {
    mode: "client",
    searchEnabled: true,
    exportEnabled: true,
    columnVisibilityEnabled: true,
    filterEnabled: true,
    exportExcludePrint: true,
    exportExtraEnabled: true,
  },
}

export const ExportOff: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { exportEnabled: false },
}

export const SearchOff: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { searchEnabled: false },
}

export const DisabledAll: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { disabled: true },
}

export const BasicPagination: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { paginationType: "Basic" },
}

export const NoPagination: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { paginationType: undefined },
}

export const SummaryOff: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { summaryEnabled: false },
}

export const SummarySingleRow: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { summaryEnabled: true, summaryMultiRow: false },
}

export const StickyHeaderOff: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { stickyHeader: false },
}

export const ColumnVisibilityOff: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { columnVisibilityEnabled: false },
}

export const FilterOff: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { filterEnabled: false },
}
