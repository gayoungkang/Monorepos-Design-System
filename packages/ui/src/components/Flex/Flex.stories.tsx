import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Flex from "./Flex"
import type { FlexProps } from "./Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Flex> = {
  title: "Components/Flex",
  component: Flex,
  parameters: { layout: "fullscreen" },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "section", "article", "main", "nav", "header", "footer"],
    },
    direction: { control: "select", options: ["row", "column", "row-reverse", "column-reverse"] },
    justify: {
      control: "select",
      options: [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
    },
    align: {
      control: "select",
      options: ["stretch", "flex-start", "center", "flex-end", "baseline"],
    },
    wrap: { control: "select", options: ["nowrap", "wrap", "wrap-reverse"] },
    gap: { control: "text" },
    extraProps: { control: false },
    children: { control: false },
  },
  args: {
    as: "div",
    direction: "row",
    justify: "flex-start",
    align: "stretch",
    wrap: "nowrap",
    gap: "8px",
  },
}

export default meta
type Story = StoryObj<typeof Flex>

const Item = ({ label }: { label: string }) => {
  return (
    <Box
      width="120px"
      height="48px"
      bgColor="#ffffff"
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
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
    const items = useMemo(() => Array.from({ length: 10 }).map((_, i) => `Item ${i + 1}`), [])
    return (
      <Box p="20px">
        <Typography variant="h3" text="Flex Playground" mb="12px" />

        <Box
          p="14px"
          bgColor="#f7f7f7"
          sx={{ border: "1px solid #eee", borderRadius: "12px" }}
          mb="12px"
        >
          <Typography
            variant="b3Regular"
            text={`as=${args.as} | direction=${args.direction} | justify=${args.justify} | align=${args.align} | wrap=${args.wrap} | gap=${String(
              args.gap,
            )}`}
            color="#666666"
          />
        </Box>

        <Flex
          {...(args as FlexProps)}
          width="100%"
          sx={{
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
            padding: "12px",
            backgroundColor: "#fafafa",
          }}
        >
          {items.map((t) => (
            <Item key={t} label={t} />
          ))}
        </Flex>
      </Box>
    )
  },
}

export const WrapAndGapDemo: Story = {
  render: () => {
    const [wrap, setWrap] = useState<FlexProps["wrap"]>("nowrap")
    const [gap, setGap] = useState<FlexProps["gap"]>("8px")

    return (
      <Flex p="20px" direction="column" width={"90%"}>
        <Typography variant="h3" text="Wrap + Gap (Interactive)" mb="12px" />

        <Flex gap="8px" mb="12px">
          <Box>
            <Typography variant="b3Regular" text="wrap" mb="6px" color="#666666" />
            <Flex gap="8px">
              <Box
                as="button"
                onClick={() => setWrap("nowrap")}
                sx={{
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: wrap === "nowrap" ? "#111827" : "#ffffff",
                  color: wrap === "nowrap" ? "#ffffff" : "#111827",
                  cursor: "pointer",
                }}
              >
                nowrap
              </Box>
              <Box
                as="button"
                onClick={() => setWrap("wrap")}
                sx={{
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: wrap === "wrap" ? "#111827" : "#ffffff",
                  color: wrap === "wrap" ? "#ffffff" : "#111827",
                  cursor: "pointer",
                }}
              >
                wrap
              </Box>
              <Box
                as="button"
                onClick={() => setWrap("wrap-reverse")}
                sx={{
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: wrap === "wrap-reverse" ? "#111827" : "#ffffff",
                  color: wrap === "wrap-reverse" ? "#ffffff" : "#111827",
                  cursor: "pointer",
                }}
              >
                wrap-reverse
              </Box>
            </Flex>
          </Box>

          <Box ml="12px">
            <Typography variant="b3Regular" text="gap" mb="6px" color="#666666" />
            <Flex gap="8px">
              {["0px", "8px", "12px", "16px", 8, 12].map((v) => (
                <Box
                  key={String(v)}
                  as="button"
                  onClick={() => setGap(v)}
                  sx={{
                    padding: "6px 10px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: String(gap) === String(v) ? "#111827" : "#ffffff",
                    color: String(gap) === String(v) ? "#ffffff" : "#111827",
                    cursor: "pointer",
                  }}
                >
                  {String(v)}
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>

        <Flex
          wrap={wrap}
          gap={gap}
          width="100%"
          sx={{
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
            padding: "12px",
            backgroundColor: "#fafafa",
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <Item key={i} label={`Item ${i + 1}`} />
          ))}
        </Flex>
      </Flex>
    )
  },
}
