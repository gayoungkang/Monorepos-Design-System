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
import type { ExportType } from "./_internal/TableToolbar"

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

  // mode/search/export
  mode?: TableMode
  searchEnabled?: boolean
  exportEnabled?: boolean
  exportScope?: "page" | "all"

  columnVisibilityEnabled?: boolean
  filterEnabled?: boolean
}

const TableInteractive = (props: TableProps<PersonRow> & TableStoryExtraProps) => {
  const [allRows, setAllRows] = useState<PersonRow[]>(makeRows())

  const [page, setPage] = useState<number>(props.tableConfig?.page ?? 1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(props.tableConfig?.rowsPerPage ?? 5)

  const [sortKey, setSortKey] = useState<keyof PersonRow | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("ASC")

  const [keyword, setKeyword] = useState<string>("")

  const [visibleKeys, setVisibleKeys] = useState<string[]>([])

  const [filters, setFilters] = useState<FilterItem[]>([])

  const [serverRows, setServerRows] = useState<PersonRow[]>([])
  const [serverTotal, setServerTotal] = useState<number>(0)

  const mode: TableMode = props.mode ?? "client"
  const totalCount = useMemo(() => allRows.length, [allRows])

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
  }, [defaultVisibleKeys.join("|")])

  const columnConfig = useMemo(() => {
    const enabled = props.columnVisibilityEnabled !== false
    if (!enabled) return baseColumnConfig

    const v = new Set(visibleKeys.length ? visibleKeys : defaultVisibleKeys)
    return baseColumnConfig.filter((c) => c.key === "custom" || v.has(String(c.key)))
  }, [props.columnVisibilityEnabled, baseColumnConfig, visibleKeys, defaultVisibleKeys])

  const clientData = useMemo(() => filteredAll, [filteredAll])

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

  const handleExport = (type: ExportType, payload: { scope: "page" | "all"; keyword: string }) => {
    if (props.disabled) return

    if (mode === "server") {
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

    if (type === "print") {
      console.log("[CLIENT PRINT]", { rows: rowsForExport.length })
      window.print()
    }
  }

  const handleFilterChange = (next: FilterItem[]) => {
    if (props.disabled) return
    setFilters(next)
    setPage(1)
  }

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
            `filters=${filters.filter((f) => (f.value ?? "").trim().length > 0).length}`,
            `summary=${showSummary ? `on${multiRow ? "(multi)" : ""}${stickySummary ? "(sticky)" : ""}` : "off"}`,
          ].join(" / ")}
        />
      </Flex>

      <TableToolbar
        title="Table"
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
        filterDrawerVariant="flex"
        filterDrawerPlacement="top"
        filterDrawerCloseBehavior="hidden"
        filterDrawerHeight={220}
        filterValue={filters as any}
        defaultFilterValue={
          [{ id: makeId(), columnKey: "name", operator: "contains", value: "" }] as any
        }
        onFilterChange={handleFilterChange as any}
        filterSkeletonEnabled={false}
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

    disabled: {
      control: "boolean",
      description: "전체 인터랙션 비활성화(정렬/편집/페이지네이션 포함)",
    },

    stickyHeader: { control: "boolean", description: "헤더 sticky" },

    paginationType: {
      control: "radio",
      options: [undefined, "Table", "Basic"],
      description: "페이지네이션 타입",
    },

    summaryEnabled: { control: "boolean", description: "요약(합산) 행 표시" },
    summarySticky: { control: "boolean", description: "요약(합산) 행 stickyBottom" },
    summaryMultiRow: { control: "boolean", description: "요약(합산) 멀티 행" },

    mode: { control: "radio", options: ["client", "server"], description: "데이터 처리 모드" },
    searchEnabled: { control: "boolean", description: "검색 툴바 표시" },
    exportEnabled: { control: "boolean", description: "Export 메뉴 표시" },
    exportScope: {
      control: "radio",
      options: ["page", "all"],
      description: "Export 범위(현재 페이지/전체)",
    },

    columnVisibilityEnabled: { control: "boolean", description: "컬럼 표시/숨기기" },
    filterEnabled: { control: "boolean", description: "필터 드로어" },

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
