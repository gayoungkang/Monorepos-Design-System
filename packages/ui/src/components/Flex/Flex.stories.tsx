import type { Meta, StoryObj } from "@storybook/react"
import Flex, { type FlexProps } from "./Flex"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Box from "../Box/Box"

const meta: Meta<FlexProps> = {
  title: "components/Flex",
  component: Flex,

  args: {
    as: "div",
    direction: "row",
    justify: "flex-start",
    align: "stretch",
    wrap: "nowrap",
    gap: "0px",
  },

  argTypes: {
    /* ---------------------------------- Flex Layout ---------------------------------- */
    as: { control: "text", description: "렌더링할 HTML 태그명" },
    direction: {
      control: "radio",
      options: ["row", "column", "row-reverse", "column-reverse"],
      description: "flex-direction",
    },
    justify: {
      control: "radio",
      options: [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
      description: "justify-content",
    },
    align: {
      control: "radio",
      options: ["stretch", "flex-start", "center", "flex-end"],
      description: "align-items",
    },
    wrap: {
      control: "radio",
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "flex-wrap",
    },
    gap: { control: "text", description: "아이템 간 간격" },

    /* ---------------------------------- BaseMixinProps ---------------------------------- */
    p: { control: "text" },
    pt: { control: "text" },
    pr: { control: "text" },
    pb: { control: "text" },
    pl: { control: "text" },
    px: { control: "text" },
    py: { control: "text" },

    m: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },

    width: { control: "text" },
    height: { control: "text" },

    sx: { control: false },
    children: { control: false },
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
  render: () => (
    <Flex gap="8px" p="16px" bgColor={theme.colors.grayscale[100]}>
      <Box p="8px" bgColor={theme.colors.primary[100]}>
        Item 1
      </Box>
      <Box p="8px" bgColor={theme.colors.primary[100]}>
        Item 2
      </Box>
      <Box p="8px" bgColor={theme.colors.primary[100]}>
        Item 3
      </Box>
    </Flex>
  ),
}

/* ─────────── Direction Variants ─────────── */
export const Directions: Story = {
  render: () => (
    <Flex gap="24px">
      <Flex direction="row" gap="8px" p="8px" bgColor={theme.colors.grayscale[100]}>
        <Box bgColor={theme.colors.primary[100]}>A</Box>
        <Box bgColor={theme.colors.primary[200]}>B</Box>
        <Box bgColor={theme.colors.primary[300]}>C</Box>
      </Flex>

      <Flex direction="column" gap="8px" p="8px" bgColor={theme.colors.grayscale[200]}>
        <Box bgColor={theme.colors.primary[100]}>A</Box>
        <Box bgColor={theme.colors.primary[200]}>B</Box>
        <Box bgColor={theme.colors.primary[300]}>C</Box>
      </Flex>
    </Flex>
  ),
}

/* ─────────── Justify & Align Variants ─────────── */
export const Alignment: Story = {
  render: () => (
    <Flex direction="column" gap="20px" width="100%">
      <Flex justify="center" gap="8px" p="12px" bgColor={theme.colors.grayscale[100]}>
        <Box bgColor={theme.colors.primary[100]}>Center</Box>
      </Flex>

      <Flex align="center" height="80px" gap="8px" p="12px" bgColor={theme.colors.grayscale[200]}>
        <Box bgColor={theme.colors.primary[200]}>Align Center</Box>
      </Flex>

      <Flex justify="space-between" gap="8px" p="12px" bgColor={theme.colors.grayscale[300]}>
        <Box bgColor={theme.colors.primary[300]}>Left</Box>
        <Box bgColor={theme.colors.primary[300]}>Right</Box>
      </Flex>
    </Flex>
  ),
}

/* ─────────── Wrap Variants ─────────── */
export const Wrap: Story = {
  render: () => (
    <Flex wrap="wrap" gap="8px" width="200px" p="12px" bgColor={theme.colors.grayscale[100]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} p="8px" bgColor={theme.colors.primary[100]}>
          {i + 1}
        </Box>
      ))}
    </Flex>
  ),
}

/* ─────────── Gap Examples ─────────── */
export const Gaps: Story = {
  render: () => (
    <Flex direction="column" gap="20px">
      <Flex gap="4px" bgColor={theme.colors.grayscale[100]}>
        <Box bgColor={theme.colors.primary[100]}>gap 4</Box>
        <Box bgColor={theme.colors.primary[100]}>gap 4</Box>
      </Flex>

      <Flex gap="16px" bgColor={theme.colors.grayscale[100]}>
        <Box bgColor={theme.colors.primary[200]}>gap 16</Box>
        <Box bgColor={theme.colors.primary[200]}>gap 16</Box>
      </Flex>
    </Flex>
  ),
}
