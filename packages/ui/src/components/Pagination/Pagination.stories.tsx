import { useMemo, useState } from "react"
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
      options: ["Table", "Basic"] satisfies PaginationType[],
    },
    disabled: { control: "boolean" },

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
    const [page, setPage] = useState(args.page ?? 1)

    const count = typeof args.count === "number" ? Math.max(0, args.count) : 0

    const pageCount = useMemo(() => {
      if (typeof args.pageCount === "number" && args.pageCount > 0)
        return Math.floor(args.pageCount)
      if (count <= 0) return 1
      return Math.max(1, Math.ceil(count / 10))
    }, [args.pageCount, count])

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
        </Flex>

        <Pagination
          {...args}
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
          type: {args.type} / page: {safePage} / pageCount: {pageCount} / count: {count}
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
    page: 1,
  },
  render: (args) => {
    const [page, setPage] = useState(args.page ?? 1)

    const count = typeof args.count === "number" ? Math.max(0, args.count) : 0
    const pageCount = Math.max(1, Math.ceil(count / 10))
    const safePage = Math.min(Math.max(1, page), pageCount)

    return (
      <Flex direction="column" gap={16} width="100%">
        <Pagination
          {...args}
          count={count}
          page={safePage}
          onPageChange={(p) => setPage(p)}
          labelDisplayedRows={(from, to, total) => `${from}–${to} / ${total}`}
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

export const Basic: Story = {
  args: {
    type: "Basic",
    disabled: false,
    count: 128,
    page: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showPrevNextButtons: true,
    showFirstLastButtons: true,
    hidePrevNextButtons: false,
    hideFirstLastButtons: false,
  },
  render: (args) => {
    const [page, setPage] = useState(args.page ?? 1)

    const count = typeof args.count === "number" ? Math.max(0, args.count) : 0
    const pageCount = useMemo(() => {
      if (typeof args.pageCount === "number" && args.pageCount > 0)
        return Math.floor(args.pageCount)
      if (count <= 0) return 1
      return Math.max(1, Math.ceil(count / 10))
    }, [args.pageCount, count])

    const safePage = Math.min(Math.max(1, page), pageCount)

    return (
      <Flex direction="column" gap={16} width="100%">
        <Pagination
          {...args}
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
