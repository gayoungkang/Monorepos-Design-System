import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Table from "./Table"
import type { TableProps, SortDirection, ColumnProps, ColumnOnChangeType } from "./@Types/table"
import TextField from "../TextField/TextField"
import { CheckBox } from "../CheckBoxGroup/CheckBoxGroup"
import Link from "../Link/Link"
import Accordion from "../Accordion/Accordion"

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

const TableInteractive = (props: TableProps<PersonRow> & { disabled?: boolean }) => {
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

  const columnConfig: ColumnProps<PersonRow>[] = useMemo(() => {
    const isDisabled = Boolean(props.disabled)

    return [
      {
        key: "id",
        title: "ID",
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
        renderCustomCell: (row) => (
          <Typography
            variant="b2Regular"
            color={isDisabled ? theme.colors.text.disabled : theme.colors.text.primary}
            text={row.id}
          />
        ),
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
        onChange: !isDisabled ? onCellChange : undefined,
        renderCustomCell: (row) => (
          <TextField
            value={row.name}
            disabled={isDisabled}
            onChange={(e) => {
              if (isDisabled) return
              onCellChange({
                type: "TextField",
                rowIndex: 0 as any,
                key: "name",
                changeValue: e.target.value,
              } as any)
            }}
          />
        ),
      },
      {
        key: "role",
        title: "Role",
        type: "Default",
        width: "120px",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "role" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
        renderCustomCell: (row) => (
          <Typography
            variant="b2Regular"
            color={isDisabled ? theme.colors.text.disabled : theme.colors.text.primary}
            text={row.role}
          />
        ),
      },
      {
        key: "active",
        title: "Active (CheckBox)",
        type: "CheckBox",
        width: "140px",
        sort: !isDisabled,
        sortDirection: !isDisabled && sortKey === "active" ? sortDirection : undefined,
        onSortChange: !isDisabled
          ? (key, next) => {
              setSortKey(key as keyof PersonRow)
              setSortDirection(next)
            }
          : undefined,
        onChange: !isDisabled ? onCellChange : undefined,
        renderCustomCell: (row) => (
          <CheckBox
            checked={row.active}
            disabled={isDisabled}
            onChange={(next) => {
              if (isDisabled) return
              onCellChange({
                type: "CheckBox",
                rowIndex: 0 as any,
                key: "active",
                changeValue: next,
              } as any)
            }}
          />
        ),
      },

      // * Accordion 컬럼 (type을 중복으로 추가하지 않고 renderCustomCell로만 추가)
      {
        key: "email",
        title: "Accordion",
        type: "Default",
        width: "360px",
        renderCustomCell: (row) => (
          <Accordion
            disabled={isDisabled}
            summary={
              <Flex align="center" justify="space-between" width="100%">
                <Typography
                  variant="b3Regular"
                  color={isDisabled ? theme.colors.text.disabled : theme.colors.text.primary}
                  text={row.email}
                />
                <Typography
                  variant="b3Regular"
                  color={isDisabled ? theme.colors.text.disabled : theme.colors.text.secondary}
                  text={row.role}
                />
              </Flex>
            }
          >
            <Flex direction="column" gap={6}>
              <Typography
                variant="b3Regular"
                color={isDisabled ? theme.colors.text.disabled : theme.colors.text.secondary}
                text={`ID: ${row.id}`}
              />
              <Typography
                variant="b3Regular"
                color={isDisabled ? theme.colors.text.disabled : theme.colors.text.secondary}
                text={`Name: ${row.name}`}
              />
              <Typography
                variant="b3Regular"
                color={isDisabled ? theme.colors.text.disabled : theme.colors.text.secondary}
                text={`Active: ${row.active ? "true" : "false"}`}
              />
            </Flex>
          </Accordion>
        ),
      },

      {
        key: "custom",
        title: "Custom (Link)",
        type: "Default",
        width: "140px",
        onClick: isDisabled
          ? undefined
          : (row, idx) => {
              // eslint-disable-next-line no-console
              console.log("Cell onClick:", { row, idx })
            },
        renderCustomCell: (row) => (
          <Link
            disabled={isDisabled}
            children={"Open"}
            onClick={() => {
              if (isDisabled) return
              // eslint-disable-next-line no-console
              console.log("Link click:", row.id)
            }}
          />
        ),
      },
    ]
  }, [props.disabled, sortKey, sortDirection])

  return (
    <Box width="100%" p={12}>
      <Flex direction="column" gap={8} mb={12}>
        <Typography
          variant="b2Regular"
          text={`disabled=${Boolean(props.disabled)} / page=${page} / rowsPerPage=${rowsPerPage} / total=${totalCount} / sort=${
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
            if (props.disabled) return
            const next = Number(e?.target?.value ?? 10)
            setRowsPerPage(next)
            setPage(1)
          },
        }}
        onPageChange={(next) => {
          if (props.disabled) return
          setPage(next)
        }}
        onRowsPerPageChange={(next) => {
          if (props.disabled) return
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

const meta: Meta<TableProps<PersonRow> & { disabled?: boolean }> = {
  title: "components/Table",
  component: TableInteractive as any,

  args: {
    tableKey: "demo-table",
    sticky: true,
    pagination: "Table",
    emptyRowText: "검색 결과가 없습니다.",
    disabled: false,
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
    disabled: { control: "boolean" },

    pagination: {
      control: "radio",
      options: [undefined, "RowsPerPage", "Table", "Basic"],
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

type Story = StoryObj<TableProps<PersonRow> & { disabled?: boolean }>

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
    disabled: true,
  },
}
