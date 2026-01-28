import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import Paper from "./Paper"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"

const meta: Meta<typeof Paper> = {
  title: "Components/Paper",
  component: Paper,
  args: {
    elevation: 4,
    radius: 4,
  },
  argTypes: {
    elevation: {
      control: { type: "number", min: 0, max: 24, step: 1 },
    },
    radius: {
      control: { type: "select" },
      options: Object.keys(theme.borderRadius).map((k) => {
        const asNumber = Number(k)
        return Number.isNaN(asNumber) ? k : asNumber
      }),
    },
    children: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Paper>

export const Playground: Story = {
  render: (args) => (
    <Paper {...args}>
      <Typography
        variant="b2Regular"
        text="Paper content"
        color={theme.colors.text.secondary}
        sx={{ lineHeight: "1.4" }}
      />
    </Paper>
  ),
}

export const Elevations: Story = {
  args: {
    radius: 8,
  },
  render: (args) => (
    <Flex gap={12} wrap="wrap">
      {[0, 1, 2, 4, 6, 8, 12, 16, 24].map((e) => (
        <Paper key={e} {...args} elevation={e} width="160px">
          <Typography variant="b2Regular" text={`elevation: ${e}`} />
        </Paper>
      ))}
    </Flex>
  ),
}

export const RadiusTokens: Story = {
  args: {
    elevation: 6,
  },
  render: (args) => {
    const keys = Object.keys(theme.borderRadius)
      .map((k) => {
        const asNumber = Number(k)
        return Number.isNaN(asNumber) ? k : asNumber
      })
      .slice(0, 10)

    return (
      <Flex gap={12} wrap="wrap">
        {keys.map((r) => (
          <Paper key={String(r)} {...args} radius={r as any} width="160px">
            <Typography variant="b2Regular" text={`radius: ${String(r)}`} />
          </Paper>
        ))}
      </Flex>
    )
  },
}

export const CustomRadiusString: Story = {
  args: {
    elevation: 8,
    radius: "18px",
  },
  render: (args) => (
    <Flex gap={12} wrap="wrap">
      <Paper {...args} width="240px">
        <Typography variant="b2Regular" text={`radius: "${String(args.radius)}"`} />
      </Paper>
      <Paper {...args} radius="9999px" width="240px">
        <Typography variant="b2Regular" text='radius: "9999px"' />
      </Paper>
    </Flex>
  ),
}
