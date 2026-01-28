import type { Meta, StoryObj } from "@storybook/react"
import { useCallback, useMemo, useState } from "react"
import Table from "./Table"
import type {
  ColumnProps,
  ServerTableFilter,
  ServerTableQuery,
  SortDirection,
} from "./@Types/table"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"

type Row = {
  id: string
  name: string
  amount: number
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  date: string
}

const makeRows = (count: number): Row[] => {
  const statuses: Row["status"][] = ["ACTIVE", "INACTIVE", "PENDING"]
  const out: Row[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(2024, 0, 1 + (i % 365))
    out.push({
      id: `row_${i + 1}`,
      name: `User ${i + 1}`,
      amount: ((i * 7919) % 100000) + 100,
      status: statuses[i % statuses.length],
      date: d.toISOString().slice(0, 10),
    })
  }
  return out
}

const applyKeyword = (rows: Row[], keyword: string) => {
  const k = keyword.trim().toLowerCase()
  if (!k) return rows
  return rows.filter((r) => r.id.toLowerCase().includes(k) || r.name.toLowerCase().includes(k))
}

const applyFilters = (rows: Row[], filters?: ServerTableFilter[]) => {
  const fs = filters ?? []
  if (fs.length === 0) return rows

  let out = rows
  for (const f of fs) {
    if (f.key === "status" && typeof f.value === "string" && f.value) {
      out = out.filter((r) => r.status === f.value)
    }
  }
  return out
}

const applySort = (rows: Row[], sort?: { key?: string; direction?: SortDirection }) => {
  const key = sort?.key as keyof Row | undefined
  const dir = sort?.direction
  if (!key || (dir !== "ASC" && dir !== "DESC")) return rows
  if (!["id", "name", "amount", "status", "date"].includes(String(key))) return rows

  const mul = dir === "ASC" ? 1 : -1
  const copied = [...rows]
  copied.sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * mul
    return String(av).localeCompare(String(bv)) * mul
  })
  return copied
}

const slicePage = (rows: Row[], page: number, rowsPerPage: number) => {
  const safePage = Math.max(1, page || 1)
  const safeRpp = Math.max(1, rowsPerPage || 10)
  const start = (safePage - 1) * safeRpp
  return rows.slice(start, start + safeRpp)
}

const buildColumns = (
  onSortChange: (key: keyof Row, direction: SortDirection) => void,
): ColumnProps<Row>[] =>
  [
    { key: "id", title: "ID", width: "160px", textAlign: "left", sort: true, onSortChange },
    { key: "name", title: "Name", width: "240px", textAlign: "left", sort: true, onSortChange },
    {
      key: "amount",
      title: "Amount",
      width: "160px",
      textAlign: "right",
      sort: true,
      onSortChange,
    },
    {
      key: "status",
      title: "Status",
      width: "160px",
      textAlign: "center",
      sort: true,
      onSortChange,
    },
    { key: "date", title: "Date", width: "160px", textAlign: "center", sort: true, onSortChange },
  ] as ColumnProps<Row>[]

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: { layout: "fullscreen" },
}
export default meta

type Story = StoryObj<typeof Table>

const StatusFilterPanel = ({
  value,
  onChange,
  onApply,
  onReset,
}: {
  value: "" | Row["status"]
  onChange: (v: "" | Row["status"]) => void
  onApply: () => void
  onReset: () => void
}) => {
  return (
    <Box p={12}>
      <Typography variant="b1Bold" text="Status Filter (mock)" />
      <Box mt={10}>
        <Flex gap={8} align="center" sx={{ flexWrap: "wrap" }}>
          <button onClick={() => onChange("")} aria-pressed={value === ""}>
            All
          </button>
          <button onClick={() => onChange("ACTIVE")} aria-pressed={value === "ACTIVE"}>
            ACTIVE
          </button>
          <button onClick={() => onChange("INACTIVE")} aria-pressed={value === "INACTIVE"}>
            INACTIVE
          </button>
          <button onClick={() => onChange("PENDING")} aria-pressed={value === "PENDING"}>
            PENDING
          </button>
        </Flex>
      </Box>

      <Box mt={12}>
        <Flex gap={8}>
          <button onClick={onApply}>Apply</button>
          <button onClick={onReset}>Reset</button>
        </Flex>
      </Box>
    </Box>
  )
}

export const Operational_AllFeatures: Story = {
  render: () => {
    const tableKey = "operational_all_features"

    const allRows = useMemo(() => makeRows(5000), [])

    const [query, setQuery] = useState<ServerTableQuery>({
      page: 1,
      rowsPerPage: 100,
      keyword: "",
      sort: { key: "amount", direction: "DESC" },
      filters: [],
    })

    const onQueryChange = useCallback((next: ServerTableQuery) => setQuery(next), [])

    const onSortChange = useCallback(
      (key: keyof Row, direction: SortDirection) => {
        onQueryChange({
          ...query,
          page: 1,
          sort: { key: String(key), direction },
        })
      },
      [onQueryChange, query],
    )

    const columnConfigBase = useMemo(() => buildColumns(onSortChange), [onSortChange])

    const allColumnKeys = useMemo(
      () => columnConfigBase.map((c) => String(c.key)),
      [columnConfigBase],
    )
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() => allColumnKeys)

    const columnConfig = useMemo(() => {
      const set = new Set(visibleColumnKeys)
      return columnConfigBase.filter((c) => set.has(String(c.key)))
    }, [columnConfigBase, visibleColumnKeys])

    const [statusDraft, setStatusDraft] = useState<"" | Row["status"]>("")
    const [statusApplied, setStatusApplied] = useState<"" | Row["status"]>("")

    const appliedFilters = useMemo<ServerTableFilter[]>(() => {
      const f: ServerTableFilter[] = []
      if (statusApplied) f.push({ key: "status", value: statusApplied })
      return f
    }, [statusApplied])

    const filterActiveCount = appliedFilters.length

    const normalizedQuery = useMemo(
      () => ({ ...query, filters: appliedFilters }),
      [query, appliedFilters],
    )

    const filtered = useMemo(() => {
      const byKeyword = applyKeyword(allRows, String(normalizedQuery.keyword ?? ""))
      const byFilter = applyFilters(byKeyword, normalizedQuery.filters)
      return byFilter
    }, [allRows, normalizedQuery.keyword, normalizedQuery.filters])

    const totalCount = filtered.length

    const serverRows = useMemo(() => {
      const sorted = applySort(filtered, normalizedQuery.sort)
      return slicePage(
        sorted,
        Number(normalizedQuery.page ?? 1),
        Number(normalizedQuery.rowsPerPage ?? 100),
      )
    }, [filtered, normalizedQuery.page, normalizedQuery.rowsPerPage, normalizedQuery.sort])

    const summaryRow = useMemo(() => {
      const sum = filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
      return {
        enabled: true,
        rows: [
          {
            label: "SUM",
            labelColumnKey: "name",
            items: [{ key: "amount" }],
          },
        ],
        data: [{ amount: sum }],
      }
    }, [filtered])

    const rowActions = useMemo(
      () => [
        {
          key: "view",
          render: (row: Row) => (
            <button type="button" onClick={() => console.log("[rowAction:view]", row.id)}>
              View
            </button>
          ),
        },
        {
          key: "copyId",
          render: (row: Row) => (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText?.(row.id)
                console.log("[rowAction:copyId]", row.id)
              }}
            >
              Copy ID
            </button>
          ),
        },
      ],
      [],
    )

    const handleApplyFilter = () => {
      setStatusApplied(statusDraft)
      onQueryChange({ ...query, page: 1 })
    }

    const handleResetFilter = () => {
      setStatusDraft("")
      setStatusApplied("")
      onQueryChange({ ...query, page: 1 })
    }

    return (
      <Box p={12}>
        <Typography
          variant="b1Bold"
          text="Operational_AllFeatures (Server-controlled + Toolbar + Summary + Column Visibility + RowActions)"
        />
        <Box mt={12}>
          <Table<Row>
            tableKey={tableKey}
            columnConfig={columnConfig}
            data={serverRows}
            query={normalizedQuery}
            totalCount={totalCount}
            onQueryChange={onQueryChange}
            height={620}
            sticky
            pagination={"Table"}
            rowsPer
            totalRows
            summaryRow={summaryRow as any}
            rowActions={rowActions as any}
            onRowClick={(row) => console.log("[rowClick]", row.id)}
            exportEnabled
            exportItems={[
              { type: "excel", label: "Excel" },
              { type: "csv", label: "CSV" },
              { type: "pdf", label: "PDF" },
              { type: "print", label: "Print" },
            ]}
            onExport={(type: any, ctx: unknown) => {
              console.log("[export]", type, ctx)
            }}
            toolbar={{
              title: "Users",
              searchEnabled: true,
              searchPlaceholder: "Search by id/name",

              filterEnabled: true,
              filterActiveCount,
              onFilterSearch: handleApplyFilter,
              onFilterReset: handleResetFilter,
              filterContent: (
                <StatusFilterPanel
                  value={statusDraft}
                  onChange={setStatusDraft}
                  onApply={handleApplyFilter}
                  onReset={handleResetFilter}
                />
              ),

              columnVisibilityEnabled: true,
              columns: columnConfigBase.map((c) => ({
                key: String(c.key),
                title: String(c.title),
                hideable: true,
              })),
              defaultVisibleColumnKeys: allColumnKeys,
              visibleColumnKeys,
              onVisibleColumnKeysChange: (keys) => setVisibleColumnKeys(keys),
              exportContext: { feature: "Operational_AllFeatures" },
            }}
          />
        </Box>
      </Box>
    )
  },
}

export const Operational_Virtualized: Story = {
  render: () => {
    const tableKey = "operational_virtualized"

    const allRows = useMemo(() => makeRows(20000), [])
    const [query, setQuery] = useState<ServerTableQuery>({
      page: 1,
      rowsPerPage: 200,
      keyword: "",
      sort: { key: "amount", direction: "DESC" },
      filters: [],
    })

    const onQueryChange = useCallback((next: ServerTableQuery) => setQuery(next), [])
    const onSortChange = useCallback(
      (key: keyof Row, direction: SortDirection) => {
        onQueryChange({ ...query, page: 1, sort: { key: String(key), direction } })
      },
      [onQueryChange, query],
    )

    const columnConfig = useMemo(() => buildColumns(onSortChange), [onSortChange])

    const filtered = useMemo(
      () => applyKeyword(allRows, String(query.keyword ?? "")),
      [allRows, query.keyword],
    )
    const totalCount = filtered.length

    const serverRows = useMemo(() => {
      const sorted = applySort(filtered, query.sort)
      return slicePage(sorted, Number(query.page ?? 1), Number(query.rowsPerPage ?? 200))
    }, [filtered, query.page, query.rowsPerPage, query.sort])

    return (
      <Box p={12}>
        <Typography
          variant="b1Bold"
          text="Operational_Virtualized (row windowing + fixed rowHeight)"
        />
        <Box mt={12}>
          <Table<Row>
            tableKey={tableKey}
            columnConfig={columnConfig}
            data={serverRows}
            query={query}
            totalCount={totalCount}
            onQueryChange={onQueryChange}
            height={640}
            sticky
            pagination={"Table"}
            rowsPer
            totalRows
            virtualized={{ enabled: true, rowHeight: 32, overscan: 8 }}
            toolbar={{
              title: "Large Dataset",
              searchEnabled: true,
              searchPlaceholder: "Search by id/name",
              exportContext: { feature: "Operational_Virtualized" },
            }}
          />
        </Box>
      </Box>
    )
  },
}

export const Operational_EmptyState: Story = {
  render: () => {
    const tableKey = "operational_empty"

    const allRows = useMemo(() => makeRows(300), [])
    const [query, setQuery] = useState<ServerTableQuery>({
      page: 1,
      rowsPerPage: 50,
      keyword: "___no_match___",
      sort: undefined,
      filters: [],
    })

    const onQueryChange = useCallback((next: ServerTableQuery) => setQuery(next), [])
    const onSortChange = useCallback(
      (key: keyof Row, direction: SortDirection) => {
        onQueryChange({ ...query, page: 1, sort: { key: String(key), direction } })
      },
      [onQueryChange, query],
    )

    const columnConfig = useMemo(() => buildColumns(onSortChange), [onSortChange])

    const filtered = useMemo(
      () => applyKeyword(allRows, String(query.keyword ?? "")),
      [allRows, query.keyword],
    )
    const totalCount = filtered.length
    const serverRows = useMemo(
      () => slicePage(filtered, Number(query.page ?? 1), Number(query.rowsPerPage ?? 50)),
      [filtered, query.page, query.rowsPerPage],
    )

    return (
      <Box p={12}>
        <Typography variant="b1Bold" text="Operational_EmptyState" />
        <Box mt={12}>
          <Table<Row>
            tableKey={tableKey}
            columnConfig={columnConfig}
            data={serverRows}
            query={query}
            totalCount={totalCount}
            onQueryChange={onQueryChange}
            height={520}
            sticky
            pagination={"Table"}
            rowsPer
            totalRows
            emptyRowText="검색 결과가 없습니다."
            toolbar={{
              title: "Empty",
              searchEnabled: true,
              searchPlaceholder: "Search by id/name",
            }}
          />
        </Box>
      </Box>
    )
  },
}

export const Guardrail_BadColumnConfigRef: Story = {
  render: () => {
    const tableKey = "guardrail_bad_column_ref"

    const allRows = useMemo(() => makeRows(1500), [])
    const [query, setQuery] = useState<ServerTableQuery>({
      page: 1,
      rowsPerPage: 100,
      keyword: "",
      sort: undefined,
      filters: [],
    })

    const onQueryChange = useCallback((next: ServerTableQuery) => setQuery(next), [])
    const [tick, setTick] = useState(0)

    const onSortChange = useCallback(
      (key: keyof Row, direction: SortDirection) => {
        onQueryChange({ ...query, page: 1, sort: { key: String(key), direction } })
      },
      [onQueryChange, query],
    )

    const columnConfig = buildColumns(onSortChange)

    const filtered = useMemo(
      () => applyKeyword(allRows, String(query.keyword ?? "")),
      [allRows, query.keyword],
    )
    const totalCount = filtered.length
    const serverRows = useMemo(() => {
      const sorted = applySort(filtered, query.sort)
      return slicePage(sorted, Number(query.page ?? 1), Number(query.rowsPerPage ?? 100))
    }, [filtered, query.page, query.rowsPerPage, query.sort])

    return (
      <Box p={12}>
        <Flex align="center" justify="space-between">
          <Typography
            variant="b1Bold"
            text="Guardrail_BadColumnConfigRef (의도적 위반: columnConfig ref 변경)"
          />
          <button onClick={() => setTick((v) => v + 1)}>Force Re-render ({tick})</button>
        </Flex>

        <Box mt={12}>
          <Table<Row>
            tableKey={tableKey}
            columnConfig={columnConfig}
            data={serverRows}
            query={query}
            totalCount={totalCount}
            onQueryChange={onQueryChange}
            height={560}
            sticky
            pagination={"Table"}
            rowsPer
            totalRows
            toolbar={{
              title: "Bad Usage",
              searchEnabled: true,
              searchPlaceholder: "Search by id/name",
            }}
          />
        </Box>
      </Box>
    )
  },
}
