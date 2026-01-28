import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Pagination from "./Pagination"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"
import { formatWithComma } from "../../utils/string"

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
  argTypes: {
    onPageChange: { action: "onPageChange", control: false },
    labelDisplayedRows: { control: false },
    icons: { control: false },
  },
}
export default meta
type Story = StoryObj<typeof Pagination>

export const Table: Story = {
  args: {
    type: "Table",
    count: 235,
    disabled: false,
    width: "fit-content",
  },
  render: (args) => {
    const [page, setPage] = useState(1)

    const labelDisplayedRows = useMemo(
      () => (from: number, to: number, count: number) => (
        <Typography
          variant="b1Bold"
          color={theme.colors.text.primary}
          text={`${from}–${to} / 총 ${formatWithComma(count)}건`}
        />
      ),
      [],
    )

    return (
      <Box>
        <Typography variant="h3" text="Pagination (Table)" mb="12px" />
        <Flex align="center" gap="12px" mb="12px">
          <Typography
            variant="b2Regular"
            color={theme.colors.text.secondary}
            text={`page: ${page}`}
          />
        </Flex>

        <Pagination
          {...args}
          page={page}
          onPageChange={(p) => {
            setPage(p)
          }}
          labelDisplayedRows={labelDisplayedRows}
        />
      </Box>
    )
  },
}

export const Basic: Story = {
  args: {
    type: "Basic",
    pageCount: 32,
    siblingCount: 1,
    boundaryCount: 1,
    showPrevNextButtons: true,
    showFirstLastButtons: true,
    hidePrevNextButtons: false,
    hideFirstLastButtons: false,
    disabled: false,
    width: "fit-content",
  },
  render: (args) => {
    const [page, setPage] = useState(7)

    return (
      <Box>
        <Typography variant="h3" text="Pagination (Basic)" mb="12px" />
        <Flex align="center" gap="12px" mb="12px">
          <Typography
            variant="b2Regular"
            color={theme.colors.text.secondary}
            text={`page: ${page}`}
          />
          <Typography
            variant="b2Regular"
            color={theme.colors.text.secondary}
            text={`pageCount: ${args.pageCount}`}
          />
        </Flex>

        <Pagination
          {...args}
          page={page}
          onPageChange={(p) => {
            setPage(p)
          }}
        />
      </Box>
    )
  },
}

export const DisabledMatrix: Story = {
  render: () => {
    const [pageA, setPageA] = useState(1)
    const [pageB, setPageB] = useState(5)

    return (
      <Box>
        <Typography variant="h3" text="Disabled / Options Matrix" mb="12px" />

        <Flex direction="column" gap="16px">
          <Box>
            <Typography variant="h2" text="Table - enabled" mb="8px" />
            <Pagination type="Table" count={120} page={pageA} onPageChange={setPageA} />
          </Box>

          <Box>
            <Typography variant="h2" text="Table - disabled" mb="8px" />
            <Pagination type="Table" count={120} page={pageA} onPageChange={setPageA} disabled />
          </Box>

          <Box>
            <Typography variant="h2" text="Basic - full controls" mb="8px" />
            <Pagination
              type="Basic"
              page={pageB}
              onPageChange={setPageB}
              pageCount={24}
              siblingCount={2}
              boundaryCount={2}
              showFirstLastButtons
              showPrevNextButtons
            />
          </Box>

          <Box>
            <Typography variant="h2" text="Basic - no first/last, no prev/next" mb="8px" />
            <Pagination
              type="Basic"
              page={pageB}
              onPageChange={setPageB}
              pageCount={24}
              siblingCount={1}
              boundaryCount={1}
              showFirstLastButtons={false}
              showPrevNextButtons={false}
            />
          </Box>

          <Box>
            <Typography variant="h2" text="Basic - disabled" mb="8px" />
            <Pagination
              type="Basic"
              page={pageB}
              onPageChange={setPageB}
              pageCount={24}
              siblingCount={1}
              boundaryCount={1}
              showFirstLastButtons
              showPrevNextButtons
              disabled
            />
          </Box>
        </Flex>
      </Box>
    )
  },
}
