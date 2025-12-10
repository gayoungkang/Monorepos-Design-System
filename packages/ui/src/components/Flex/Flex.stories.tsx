import type { Meta, StoryObj } from "@storybook/react"
import Flex, { type FlexProps } from "./Flex"
import { ThemeProvider } from "styled-components"
import { theme } from "../tokens/theme"

const meta: Meta<FlexProps> = {
  title: "Atoms/Layout/Flex",
  component: Flex,
  args: {
    as: "div",
    direction: "row",
    justify: "flex-start",
    align: "stretch",
    wrap: "nowrap",
    gap: "8px",
  },
  argTypes: {
    /* --- Flex Props --- */
    direction: {
      control: "radio",
      options: ["row", "column", "row-reverse", "column-reverse"],
      description: "flex direction",
    },
    justify: {
      control: "radio",
      options: ["flex-start", "center", "flex-end", "space-between", "space-around"],
      description: "justify-content",
    },
    align: {
      control: "radio",
      options: ["stretch", "center", "flex-start", "flex-end", "baseline"],
      description: "align-items",
    },
    wrap: {
      control: "radio",
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "flex-wrap",
    },
    gap: {
      control: "text",
      description: "items gap",
    },

    /* --- BaseMixinProps --- */
    p: { control: "text", description: "padding shorthand" },
    pt: { control: "text", description: "padding-top" },
    pr: { control: "text", description: "padding-right" },
    pb: { control: "text", description: "padding-bottom" },
    pl: { control: "text", description: "padding-left" },
    px: { control: "text", description: "padding X" },
    py: { control: "text", description: "padding Y" },

    m: { control: "text", description: "margin shorthand" },
    mt: { control: "text", description: "margin-top" },
    mr: { control: "text", description: "margin-right" },
    mb: { control: "text", description: "margin-bottom" },
    ml: { control: "text", description: "margin-left" },
    mx: { control: "text", description: "margin X" },
    my: { control: "text", description: "margin Y" },

    width: { control: "text", description: "component width" },
    height: { control: "text", description: "component height" },

    /* sx disable */
    sx: { control: false },
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

type Story = StoryObj<FlexProps>

/* ─────────── Default ─────────── */
export const Default: Story = {
  render: (args) => (
    <Flex {...args} p="16px" style={{ border: "1px solid #ddd" }}>
      <div>Item 1</div>
      <div>Item 2</div>
    </Flex>
  ),
}

/* ─────────── Direction ─────────── */
export const Direction: Story = {
  render: () => (
    <Flex direction="column" gap="8px" p="12px" style={{ border: "1px solid #ddd" }}>
      <div>Column 1</div>
      <div>Column 2</div>
    </Flex>
  ),
}

/* ─────────── Justify ─────────── */
export const Justify: Story = {
  render: () => (
    <Flex justify="space-between" p="12px" style={{ border: "1px solid #ddd" }}>
      <div>A</div>
      <div>B</div>
    </Flex>
  ),
}

/* ─────────── Align ─────────── */
export const Align: Story = {
  render: () => (
    <Flex align="center" height="100px" p="12px" style={{ border: "1px solid #ddd" }}>
      <div>Align Center</div>
    </Flex>
  ),
}

/* ─────────── Gap ─────────── */
export const Gap: Story = {
  render: () => (
    <Flex gap="24px" p="12px" style={{ border: "1px solid #ddd" }}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </Flex>
  ),
}
