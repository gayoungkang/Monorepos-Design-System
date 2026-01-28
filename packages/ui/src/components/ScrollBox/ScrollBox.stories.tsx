import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import ScrollBox, { ScrollBoxProps } from "./ScrollBox"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof ScrollBox> = {
  title: "Components/ScrollBox",
  component: ScrollBox,
  parameters: { layout: "padded" },
  argTypes: {
    children: { control: false },

    width: { control: "text" },
    height: { control: "text" },

    minWidth: { control: "text" },
    minHeight: { control: "text" },

    maxWidth: { control: "text" },
    maxHeight: { control: "text" },

    overflow: { control: "select", options: ["auto", "hidden", "scroll", "visible"] },

    p: { control: false },
    m: { control: false },
    px: { control: false },
    my: { control: false },
    bgColor: { control: false },
    sx: { control: false },
  },
} satisfies Meta<typeof ScrollBox>

export default meta
type Story = StoryObj<typeof ScrollBox>

const Items = ({ count }: { count: number }) => {
  return (
    <Flex direction="column" gap="8px" sx={{ padding: "12px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            border: "1px solid",
            borderColor: "border.default",
            borderRadius: "10px",
            padding: "10px",
          }}
        >
          <Typography text={`Item ${i + 1}`} variant="b3Regular" color="text.primary" />
        </Box>
      ))}
    </Flex>
  )
}

export const Playground: Story = {
  args: {
    width: "320px",
    height: "220px",
    minWidth: "initial",
    minHeight: "initial",
    maxWidth: "100%",
    maxHeight: "none",
    overflow: "auto",
  } as ScrollBoxProps,
  render: (args) => {
    const [count, setCount] = useState(30)

    const hint = useMemo(() => {
      return `items=${count} / overflow=${String(args.overflow)}`
    }, [count, args.overflow])

    return (
      <Flex direction="column" gap="12px">
        <Typography text={hint} variant="b2Regular" color="text.primary" />
        <Flex gap="8px">
          <Box
            as="button"
            sx={{
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "border.default",
              backgroundColor: "background.default",
              cursor: "pointer",
            }}
            onClick={() => setCount((p) => Math.max(1, p - 10))}
          >
            <Typography text="-10" variant="b3Regular" color="text.primary" />
          </Box>

          <Box
            as="button"
            sx={{
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "border.default",
              backgroundColor: "background.default",
              cursor: "pointer",
            }}
            onClick={() => setCount((p) => p + 10)}
          >
            <Typography text="+10" variant="b3Regular" color="text.primary" />
          </Box>
        </Flex>

        <ScrollBox {...args}>
          <Items count={count} />
        </ScrollBox>
      </Flex>
    )
  },
}

export const AllCases: Story = {
  render: () => {
    return (
      <Flex direction="column" gap="16px">
        <Typography text="AllCases" variant="b2Regular" color="text.primary" />

        <Flex gap="16px" wrap="wrap">
          <Flex direction="column" gap="8px">
            <Typography text="overflow=auto" variant="b3Regular" color="text.secondary" />
            <ScrollBox width="260px" height="180px" overflow="auto">
              <Items count={25} />
            </ScrollBox>
          </Flex>

          <Flex direction="column" gap="8px">
            <Typography text="overflow=scroll" variant="b3Regular" color="text.secondary" />
            <ScrollBox width="260px" height="180px" overflow="scroll">
              <Items count={25} />
            </ScrollBox>
          </Flex>

          <Flex direction="column" gap="8px">
            <Typography text="overflow=hidden" variant="b3Regular" color="text.secondary" />
            <ScrollBox width="260px" height="180px" overflow="hidden">
              <Items count={25} />
            </ScrollBox>
          </Flex>

          <Flex direction="column" gap="8px">
            <Typography text="maxHeight=120 (auto)" variant="b3Regular" color="text.secondary" />
            <ScrollBox width="260px" maxHeight="120px" height="auto" overflow="auto">
              <Items count={25} />
            </ScrollBox>
          </Flex>
        </Flex>
      </Flex>
    )
  },
}

export const Variants: Story = {
  render: () => {
    const cases: Array<{ title: string; props: ScrollBoxProps }> = [
      {
        title: "Fixed 320x200",
        props: { width: "320px", height: "200px", overflow: "auto", children: null as any },
      },
      {
        title: "MaxHeight 140 (height=auto)",
        props: {
          width: "320px",
          height: "auto",
          maxHeight: "140px",
          overflow: "auto",
          children: null as any,
        },
      },
      {
        title: "MinHeight 180",
        props: {
          width: "320px",
          height: "auto",
          minHeight: "180px",
          overflow: "auto",
          children: null as any,
        },
      },
    ]

    return (
      <Flex direction="column" gap="14px">
        <Typography text="Variants" variant="b2Regular" color="text.primary" />

        {cases.map((c) => (
          <Flex key={c.title} direction="column" gap="8px">
            <Typography text={c.title} variant="b3Regular" color="text.secondary" />
            <ScrollBox {...c.props}>
              <Items count={30} />
            </ScrollBox>
          </Flex>
        ))}
      </Flex>
    )
  },
}
