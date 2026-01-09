import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import { ThemeProvider } from "styled-components"

import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

import Table from "./Table"
import type { TableProps, SortDirection, ColumnProps, ColumnOnChangeType } from "./@Types/table"

/* -------------------------------------------------------------------------- */
/*                          Interactive Wrapper (핵심)                        */
/* -------------------------------------------------------------------------- */

type PersonRow = {
  id: string
  name: string
  role: string
  email: string
  active: boolean
  custom?: string
}

const makeRows = (): PersonRow[] => [
  {
    id: "U-001",
    name: "Alice",
    role: "Admin",
    email: "alice@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-002",
    name: "Bob",
    role: "Editor",
    email: "bob@demo.com",
    active: false,
    custom: "View",
  },
  {
    id: "U-003",
    name: "Chris",
    role: "Viewer",
    email: "chris@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-004",
    name: "Daisy",
    role: "Editor",
    email: "daisy@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-005",
    name: "Evan",
    role: "Viewer",
    email: "evan@demo.com",
    active: false,
    custom: "View",
  },
  {
    id: "U-006",
    name: "Fiona",
    role: "Admin",
    email: "fiona@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-007",
    name: "Gabe",
    role: "Editor",
    email: "gabe@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-008",
    name: "Hana",
    role: "Viewer",
    email: "hana@demo.com",
    active: false,
    custom: "View",
  },
  { id: "U-009", name: "Ian", role: "Editor", email: "ian@demo.com", active: true, custom: "View" },
  {
    id: "U-010",
    name: "Jane",
    role: "Admin",
    email: "jane@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-011",
    name: "Kyle",
    role: "Viewer",
    email: "kyle@demo.com",
    active: false,
    custom: "View",
  },
  { id: "U-012", name: "Lia", role: "Editor", email: "lia@demo.com", active: true, custom: "View" },
  {
    id: "U-013",
    name: "Mina",
    role: "Viewer",
    email: "mina@demo.com",
    active: true,
    custom: "View",
  },
  {
    id: "U-014",
    name: "Noah",
    role: "Admin",
    email: "noah@demo.com",
    active: false,
    custom: "View",
  },
  {
    id: "U-015",
    name: "Owen",
    role: "Editor",
    email: "owen@demo.com",
    active: true,
    custom: "View",
  },
]

const sortRows = (rows: PersonRow[], key: keyof PersonRow, dir: SortDirection) => {
  const copy = [...rows]
  copy.sort((a, b) => {
    const av = a[key]
    const bv = b[key]

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

const TableInteractive = (props: TableProps<PersonRow>) => {
  const [allRows, setAllRows] = useState<PersonRow[]>(makeRows())

  const [page, setPage] = useState<number>(props.tableConfig?.page ?? 1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(props.tableConfig?.rowsPerPage ?? 10)

  const [sortKey, setSortKey] = useState<keyof PersonRow | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("ASC")

  const totalCount = useMemo(() => allRows.length, [allRows])

  const sorted = useMemo(() => {
    if (!sortKey) return allRows
    return sortRows(allRows, sortKey, sortDirection)
  }, [allRows, sortKey, sortDirection])

  const pageRows = useMemo(() => paginate(sorted, page, rowsPerPage), [sorted, page, rowsPerPage])

  const onCellChange = (c: ColumnOnChangeType<PersonRow>) => {
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

  const columnConfig: ColumnProps<PersonRow>[] = useMemo(
    () => [
      {
        key: "id",
        title: "ID",
        type: "Default",
        width: "110px",
        textAlign: "left",
        sort: true,
        sortDirection: sortKey === "id" ? sortDirection : undefined,
        onSortChange: (key, next) => {
          setSortKey(key as keyof PersonRow)
          setSortDirection(next)
        },
      },
      {
        key: "name",
        title: "Name (TextField)",
        type: "TextField",
        textAlign: "left",
        sort: true,
        sortDirection: sortKey === "name" ? sortDirection : undefined,
        onSortChange: (key, next) => {
          setSortKey(key as keyof PersonRow)
          setSortDirection(next)
        },
        onChange: onCellChange,
      },
      {
        key: "role",
        title: "Role",
        type: "Default",
        width: "120px",
        sort: true,
        sortDirection: sortKey === "role" ? sortDirection : undefined,
        onSortChange: (key, next) => {
          setSortKey(key as keyof PersonRow)
          setSortDirection(next)
        },
      },
      {
        key: "active",
        title: "Active (CheckBox)",
        type: "CheckBox",
        width: "140px",
        sort: true,
        sortDirection: sortKey === "active" ? sortDirection : undefined,
        onSortChange: (key, next) => {
          setSortKey(key as keyof PersonRow)
          setSortDirection(next)
        },
        onChange: onCellChange,
      },
      {
        key: "custom",
        title: "Custom (Link)",
        type: "Default",
        width: "140px",
        onClick: (row, idx) => {
          // eslint-disable-next-line no-console
          console.log("Cell onClick:", { row, idx })
        },
        renderCellTitle: "Open",
      },
    ],
    [sortKey, sortDirection],
  )

  return (
    <Box width="100%" p={12}>
      <Flex direction="column" gap={8} mb={12}>
        <Typography
          variant="b2Regular"
          text={`page=${page} / rowsPerPage=${rowsPerPage} / total=${totalCount} / sort=${
            sortKey ? `${String(sortKey)} ${sortDirection}` : "none"
          }`}
        />
      </Flex>

      <Table
        {...(props as any)}
        tableKey={props.tableKey}
        columnConfig={columnConfig}
        data={pageRows}
        pagination={props.pagination}
        sticky={props.sticky}
        emptyRowText={props.emptyRowText}
        tableConfig={{
          ...props.tableConfig,
          totalCount,
          rowsPerPageOptions: props.tableConfig?.rowsPerPageOptions ?? [5, 10, 25],
          rowsPerPage,
          page,
          handleOnRowsPerPageChange: (e: any) => {
            const next = Number(e?.target?.value ?? 10)
            setRowsPerPage(next)
            setPage(1)
          },
        }}
        onPageChange={(next) => setPage(next)}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(1)
        }}
      />
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Meta 설정                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<TableProps<PersonRow>> = {
  title: "components/Table",
  component: TableInteractive as any,

  args: {
    tableKey: "demo-table",
    sticky: true,
    pagination: "Table",
    emptyRowText: "검색 결과가 없습니다.",
    data: [],
    columnConfig: [] as any,
    tableConfig: {
      rowsPerPageOptions: [5, 10, 25],
      rowsPerPage: 10,
      page: 1,
      totalCount: 0,
    },
  },

  argTypes: {
    tableKey: { control: "text" },
    sticky: { control: "boolean" },

    pagination: {
      control: "radio",
      options: [undefined, "RowsPerPage", "Table", "Basic"],
      description: "페이지네이션 타입 (없으면 미노출)",
    },

    emptyRowText: { control: "text" },

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

type Story = StoryObj<TableProps<PersonRow>>

/* -------------------------------------------------------------------------- */
/*                                   Stories                                   */
/* -------------------------------------------------------------------------- */

export const TablePagination: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { pagination: "Table" },
}

export const RowsPerPageOnly: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { pagination: "RowsPerPage" },
}

export const BasicPagination: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { pagination: "Basic" },
}

export const NoPagination: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: { pagination: undefined },
}

export const DisabledCellsPreview: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: {
    pagination: "Table",
  },
}

export const Playground: Story = {
  render: (args) => <TableInteractive {...(args as any)} />,
  args: {
    sticky: true,
    pagination: "Table",
    emptyRowText: "검색 결과가 없습니다.",
  },
}
