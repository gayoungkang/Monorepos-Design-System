import type { Meta, StoryObj } from "@storybook/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import InfiniteTable, { type TableRowAction } from "./InfiniteTable"
import type {
  ColumnProps,
  ServerTableFilter,
  ServerTableQuery,
  SortDirection,
} from "./@Types/table"
import type { SummaryRowProps } from "./_internal/TableSummaryRow"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"

type Row = {
  id: string
  name: string
  amount: number
  qty: number
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
      qty: ((i * 37) % 50) + 1,
      status: statuses[i % statuses.length],
      date: d.toISOString().slice(0, 10),
    })
  }
  return out
}

const applyKeyword = (rows: Row[], keyword: string): Row[] => {
  const k = keyword.trim().toLowerCase()
  if (!k) return rows
  return rows.filter((r) => r.id.toLowerCase().includes(k) || r.name.toLowerCase().includes(k))
}

const applyFilters = (rows: Row[], filters?: ServerTableFilter[]): Row[] => {
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

const applySort = (rows: Row[], sort?: { key?: string; direction?: SortDirection }): Row[] => {
  const key = sort?.key as keyof Row | undefined
  const dir = sort?.direction
  if (!key || (dir !== "ASC" && dir !== "DESC")) return rows
  if (!["id", "name", "amount", "qty", "status", "date"].includes(String(key))) return rows

  const mul = dir === "ASC" ? 1 : -1
  const copied = [...rows]
  copied.sort((a: Row, b: Row) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * mul
    return String(av).localeCompare(String(bv)) * mul
  })
  return copied
}

const buildColumns = (onSortChange: (key: keyof Row, direction: SortDirection) => void) =>
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
    { key: "qty", title: "Qty", width: "120px", textAlign: "right", sort: true, onSortChange },
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
          <button type="button" onClick={() => onChange("")} aria-pressed={value === ""}>
            All
          </button>
          <button
            type="button"
            onClick={() => onChange("ACTIVE")}
            aria-pressed={value === "ACTIVE"}
          >
            ACTIVE
          </button>
          <button
            type="button"
            onClick={() => onChange("INACTIVE")}
            aria-pressed={value === "INACTIVE"}
          >
            INACTIVE
          </button>
          <button
            type="button"
            onClick={() => onChange("PENDING")}
            aria-pressed={value === "PENDING"}
          >
            PENDING
          </button>
        </Flex>
      </Box>

      <Box mt={12}>
        <Flex gap={8}>
          <button type="button" onClick={onApply}>
            Apply
          </button>
          <button type="button" onClick={onReset}>
            Reset
          </button>
        </Flex>
      </Box>
    </Box>
  )
}

const meta: Meta<typeof InfiniteTable> = {
  title: "Components/InfiniteTable",
  component: InfiniteTable,
  parameters: { layout: "fullscreen" },
}
export default meta

type Story = StoryObj<typeof InfiniteTable>

export const Operational_Infinite_AllFeatures: Story = {
  render: () => {
    const tableKey = "operational_infinite_all_features"
    const allRows = useMemo(() => makeRows(50000), [])

    const [query, setQuery] = useState<ServerTableQuery>({
      page: 1,
      rowsPerPage: 200,
      keyword: "",
      sort: { key: "amount", direction: "DESC" },
      filters: [],
    })

    const [statusDraft, setStatusDraft] = useState<"" | Row["status"]>("")
    const [statusApplied, setStatusApplied] = useState<"" | Row["status"]>("")

    const appliedFilters = useMemo<ServerTableFilter[]>(() => {
      const f: ServerTableFilter[] = []
      if (statusApplied) f.push({ key: "status", value: statusApplied })
      return f
    }, [statusApplied])

    const normalizedQuery = useMemo<ServerTableQuery>(
      () => ({
        ...query,
        keyword: String(query.keyword ?? ""),
        filters: appliedFilters,
      }),
      [query, appliedFilters],
    )

    const onQueryChange = useCallback((next: ServerTableQuery) => setQuery(next), [])

    const onSortChange = useCallback(
      (key: keyof Row, direction: SortDirection) => {
        onQueryChange({ ...query, sort: { key: String(key), direction } })
      },
      [onQueryChange, query],
    )

    const columns = useMemo<ColumnProps<Row>[]>(() => buildColumns(onSortChange), [onSortChange])

    const filteredAll = useMemo<Row[]>(() => {
      const byKeyword = applyKeyword(allRows, String(normalizedQuery.keyword ?? ""))
      const byFilter = applyFilters(byKeyword, normalizedQuery.filters)
      const bySort = applySort(byFilter, normalizedQuery.sort)
      return bySort
    }, [allRows, normalizedQuery.keyword, normalizedQuery.filters, normalizedQuery.sort])

    const totalCount = filteredAll.length

    const chunkSize = 200
    const [cursor, setCursor] = useState<number>(chunkSize)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
      setCursor(chunkSize)
    }, [
      normalizedQuery.keyword,
      JSON.stringify(normalizedQuery.filters ?? []),
      normalizedQuery.sort?.key,
      normalizedQuery.sort?.direction,
    ])

    const visibleRows = useMemo<Row[]>(() => filteredAll.slice(0, cursor), [filteredAll, cursor])
    const hasMore = cursor < filteredAll.length

    const loadMore = useCallback(() => {
      if (loading) return
      if (!hasMore) return

      setLoading(true)
      window.setTimeout(() => {
        setCursor((prev: number) => Math.min(filteredAll.length, prev + chunkSize))
        setLoading(false)
      }, 600)
    }, [loading, hasMore, filteredAll.length])

    const rowActions = useMemo<TableRowAction<Row>[]>(
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

    const summaryRow = useMemo<SummaryRowProps<Row>>(() => {
      const sums = filteredAll.reduce(
        (acc: { amount: number; qty: number }, r: Row) => {
          acc.amount += Number(r.amount) || 0
          acc.qty += Number(r.qty) || 0
          return acc
        },
        { amount: 0, qty: 0 },
      )

      return {
        enabled: true,
        rows: [
          {
            label: "SUM",
            labelColumnKey: "name",
            items: [{ key: "amount" }, { key: "qty" }],
          },
        ],
        data: [{ amount: sums.amount, qty: sums.qty }],
      }
    }, [filteredAll])

    return (
      <Box p={12}>
        <Typography variant="b1Bold" text="Operational_Infinite_AllFeatures" />
        <Box mt={12}>
          <InfiniteTable<Row>
            tableKey={tableKey}
            columnConfig={columns}
            data={visibleRows}
            query={normalizedQuery}
            totalCount={totalCount}
            onQueryChange={onQueryChange}
            height={640}
            sticky
            summaryRow={summaryRow}
            rowActions={rowActions}
            onRowClick={(row: Row) => console.log("[rowClick]", row.id)}
            exportEnabled
            exportItems={[
              { type: "excel", label: "Excel" },
              { type: "csv", label: "CSV" },
              { type: "pdf", label: "PDF" },
              { type: "print", label: "Print" },
            ]}
            excludeExportTypes={[]}
            onExport={(type: any, ctx: unknown) => console.log("[export]", type, ctx)}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            virtualized={{ enabled: true, rowHeight: 32, overscan: 10 }}
            toolbar={{
              title: "Users (Infinite)",
              searchEnabled: true,
              searchPlaceholder: "Search by id/name",
              filterEnabled: true,
              filterActiveCount: statusApplied ? 1 : 0,
              onFilterReset: () => {
                setStatusDraft("")
                setStatusApplied("")
              },
              onFilterSearch: () => {
                setStatusApplied(statusDraft)
              },
              filterContent: (
                <StatusFilterPanel
                  value={statusDraft}
                  onChange={setStatusDraft}
                  onApply={() => setStatusApplied(statusDraft)}
                  onReset={() => {
                    setStatusDraft("")
                    setStatusApplied("")
                  }}
                />
              ),
              columnVisibilityEnabled: false,
            }}
          />
        </Box>
      </Box>
    )
  },
}
