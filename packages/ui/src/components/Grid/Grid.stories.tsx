import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Grid from "./Grid"
import type { GridProps } from "./Grid"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Grid> = {
  title: "Components/Grid",
  component: Grid,
  parameters: { layout: "fullscreen" },
  argTypes: {
    columns: { control: "text" },
    gap: { control: "text" },
  },
  args: {
    columns: "1fr 1fr 1fr",
    gap: "12px",
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const Cell = ({ label }: { label: string }) => {
  return (
    <Box
      height="64px"
      sx={{
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="b2Regular" text={label} />
    </Box>
  )
}

export const Playground: Story = {
  render: (args) => {
    const items = useMemo(() => Array.from({ length: 12 }).map((_, i) => `Cell ${i + 1}`), [])
    return (
      <Box p="20px" width={"100%"}>
        <Typography variant="h3" text="Grid Playground" mb="12px" />

        <Box
          p="14px"
          bgColor="#f7f7f7"
          sx={{ border: "1px solid #eee", borderRadius: "12px" }}
          mb="12px"
        >
          <Typography
            variant="b3Regular"
            text={`columns="${args.columns}" | gap="${String(args.gap)}"`}
            color="#666666"
          />
        </Box>

        <Grid
          {...(args as GridProps)}
          width="100%"
          sx={{
            padding: "12px",
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
            backgroundColor: "#fafafa",
          }}
        >
          {items.map((t) => (
            <Cell key={t} label={t} />
          ))}
        </Grid>
      </Box>
    )
  },
}

export const InteractivePresets: Story = {
  render: () => {
    const [columns, setColumns] = useState<string>("1fr 1fr 1fr")
    const [gap, setGap] = useState<GridProps["gap"]>(12)

    return (
      <Box p="20px" width={"100%"}>
        <Typography variant="h3" text="Grid Presets (Interactive)" mb="12px" />

        <Flex gap="10px" wrap="wrap" mb="12px">
          {[
            "1fr 1fr",
            "1fr 1fr 1fr",
            "200px 1fr",
            "200px 1fr 1fr",
            "repeat(4, minmax(0, 1fr))",
          ].map((c) => (
            <Box
              key={c}
              as="button"
              onClick={() => setColumns(c)}
              sx={{
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: columns === c ? "#111827" : "#ffffff",
                color: columns === c ? "#ffffff" : "#111827",
                cursor: "pointer",
              }}
            >
              {c}
            </Box>
          ))}

          {([0, 8, 12, 16, "24px"] as Array<GridProps["gap"]>).map((g) => (
            <Box
              key={String(g)}
              as="button"
              onClick={() => setGap(g)}
              sx={{
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: String(gap) === String(g) ? "#111827" : "#ffffff",
                color: String(gap) === String(g) ? "#ffffff" : "#111827",
                cursor: "pointer",
              }}
            >
              gap={String(g)}
            </Box>
          ))}
        </Flex>

        <Box mb="10px">
          <Typography
            variant="b3Regular"
            text={`columns="${columns}" | gap="${String(gap)}"`}
            color="#666666"
          />
        </Box>

        <Grid
          columns={columns}
          gap={gap}
          width="100%"
          sx={{
            padding: "12px",
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
            backgroundColor: "#fafafa",
          }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <Cell key={i} label={`Cell ${i + 1}`} />
          ))}
        </Grid>
      </Box>
    )
  },
}
