import React, { useMemo, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import Pagination from "./Pagination"
import type { PaginationType } from "./Pagination"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { theme } from "../../tokens/theme"

/* ------------------------------------------------------------------ */
/* meta */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  argTypes: {
    type: {
      control: "radio",
      options: ["RowsPerPage", "Table", "Basic"] satisfies PaginationType[],
    },
    disabled: { control: "boolean" },

    rowsPerPage: { control: { type: "number", min: 1, step: 1 } },
    rowsPerPageOptions: { control: false },
    onRowsPerPageChange: { control: false },
    rowsPerPageLabel: { control: "text" },

    count: { control: { type: "number", min: 0, step: 1 } },
    page: { control: { type: "number", min: 1, step: 1 } },
    onPageChange: { control: false },
    labelDisplayedRows: { control: false },

    pageCount: { control: { type: "number", min: 1, step: 1 } },
    siblingCount: { control: { type: "number", min: 0, step: 1 } },
    boundaryCount: { control: { type: "number", min: 0, step: 1 } },
    hidePrevNextButtons: { control: "boolean" },
    hideFirstLastButtons: { control: "boolean" },
    showFirstLastButtons: { control: "boolean" },
    showPrevNextButtons: { control: "boolean" },

    icons: { control: false },
  },
  args: {
    type: "Basic",
    disabled: false,

    rowsPerPage: 10,
    rowsPerPageLabel: "Rows per page:",

    count: 128,
    page: 1,

    pageCount: 10,
    siblingCount: 1,
    boundaryCount: 1,
    hidePrevNextButtons: false,
    hideFirstLastButtons: false,
    showFirstLastButtons: false,
    showPrevNextButtons: true,
  },
  decorators: [
    (Story) => (
      <Box p={24} bgColor={theme.colors.background.default} width="100%">
        <Story />
      </Box>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Pagination>

/* ------------------------------------------------------------------ */
/* stories */
/* ------------------------------------------------------------------ */

export const Playground: Story = {
  render: (args) => {
    const [rowsPerPage, setRowsPerPage] = useState(args.rowsPerPage ?? 10)
    const [page, setPage] = useState(args.page ?? 1)

    const rowsPerPageOptions = useMemo(() => [10, 25, 50, 100], [])
    const count = typeof args.count === "number" ? args.count : 128

    const pageCount = useMemo(() => {
      if (args.type === "Basic") {
        if (typeof args.pageCount === "number" && args.pageCount > 0)
          return Math.floor(args.pageCount)
        return Math.max(1, Math.ceil(count / rowsPerPage))
      }
      return Math.max(1, Math.ceil(count / rowsPerPage))
    }, [args.type, args.pageCount, count, rowsPerPage])

    const safePage = Math.min(Math.max(1, page), pageCount)

    return (
      <Flex direction="column" gap={16} width="100%">
        <Flex gap={8} align="center" wrap="wrap">
          <Button text="First" variant="outlined" onClick={() => setPage(1)} />

          <Button
            text="Prev"
            variant="outlined"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />

          <Button
            text="Next"
            variant="outlined"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          />

          <Button text="Last" variant="outlined" onClick={() => setPage(pageCount)} />

          <Button
            text="Reset"
            variant="text"
            onClick={() => {
              setRowsPerPage(args.rowsPerPage ?? 10)
              setPage(args.page ?? 1)
            }}
          />
        </Flex>

        <Pagination
          {...args}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n)
            setPage(1)
          }}
          count={count}
          page={safePage}
          onPageChange={(p) => setPage(p)}
          pageCount={args.type === "Basic" ? pageCount : undefined}
        />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          type: {args.type} / page: {safePage} / rowsPerPage: {rowsPerPage} / pageCount: {pageCount}
        </Box>
      </Flex>
    )
  },
}

export const RowsPerPage: Story = {
  args: {
    type: "RowsPerPage",
    disabled: false,
    rowsPerPage: 25,
    rowsPerPageLabel: "Rows per page:",
  },
  render: (args) => {
    const [rowsPerPage, setRowsPerPage] = useState(args.rowsPerPage ?? 25)

    return (
      <Flex direction="column" gap={16} width="100%">
        <Pagination
          {...args}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={(n) => setRowsPerPage(n)}
        />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          rowsPerPage: {rowsPerPage}
        </Box>
      </Flex>
    )
  },
}

export const Table: Story = {
  args: {
    type: "Table",
    disabled: false,
    count: 128,
    rowsPerPage: 10,
    page: 1,
  },
  render: (args) => {
    const [rowsPerPage, setRowsPerPage] = useState(args.rowsPerPage ?? 10)
    const [page, setPage] = useState(args.page ?? 1)

    const count = typeof args.count === "number" ? args.count : 128
    const pageCount = Math.max(1, Math.ceil(count / rowsPerPage))
    const safePage = Math.min(Math.max(1, page), pageCount)

    return (
      <Flex direction="column" gap={16} width="100%">
        <Pagination
          {...args}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n)
            setPage(1)
          }}
          count={count}
          page={safePage}
          onPageChange={(p) => setPage(p)}
          labelDisplayedRows={(from, to, total) => `${from}–${to} of ${total}`}
        />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          page: {safePage} / rowsPerPage: {rowsPerPage} / count: {count}
        </Box>
      </Flex>
    )
  },
}

export const Basic: Story = {
  args: {
    type: "Basic",
    disabled: false,
    count: 128,
    rowsPerPage: 10,
    page: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showPrevNextButtons: true,
    showFirstLastButtons: true,
    hidePrevNextButtons: false,
    hideFirstLastButtons: false,
  },
  render: (args) => {
    const [rowsPerPage, setRowsPerPage] = useState(args.rowsPerPage ?? 10)
    const [page, setPage] = useState(args.page ?? 1)

    const count = typeof args.count === "number" ? args.count : 128
    const pageCount = Math.max(1, Math.ceil(count / rowsPerPage))
    const safePage = Math.min(Math.max(1, page), pageCount)

    return (
      <Flex direction="column" gap={16} width="100%">
        <Pagination
          {...args}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n)
            setPage(1)
          }}
          count={count}
          page={safePage}
          onPageChange={(p) => setPage(p)}
          pageCount={pageCount}
        />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          page: {safePage} / pageCount: {pageCount} / count: {count}
        </Box>
      </Flex>
    )
  },
}
