import type { Meta, StoryObj } from "@storybook/react"
import Progress, { type ProgressProps } from "./Progress"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"

const meta: Meta<ProgressProps> = {
  title: "components/Progress",
  component: Progress,

  args: {
    type: "bar",
    variant: "indeterminate",
    value: 0,
    height: "4px",
    size: "36px",
    color: theme.colors.primary[400],
    backgroundColor: theme.colors.dim.default,
  },

  argTypes: {
    /* ---------------------------------- UI ---------------------------------- */
    type: {
      control: "radio",
      options: ["bar", "Circular"],
      description: "Progress type",
    },
    variant: {
      control: "radio",
      options: ["determinate", "indeterminate"],
      description: "determinate 값 기반 / indeterminate 무한 로딩",
    },
    value: {
      control: "number",
      description: "determinate value (0~100)",
    },
    color: {
      control: "text",
      description: "progress color",
    },
    backgroundColor: {
      control: "text",
      description: "track / 배경 색상",
    },
    height: {
      control: "text",
      description: "bar 높이",
    },
    size: {
      control: "text",
      description: "Circular 크기",
    },
    label: { control: "text", description: "Progress 라벨" },

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

type Story = StoryObj<ProgressProps>

/* ─────────── Default ─────────── */
export const Default: Story = {
  args: {
    type: "bar",
    variant: "indeterminate",
  },
}

/* ─────────── Determinate Bar ─────────── */
export const DeterminateBar: Story = {
  args: {
    type: "bar",
    variant: "determinate",
    value: 65,
    label: "진행률",
  },
}

/* ─────────── Indeterminate Bar ─────────── */
export const IndeterminateBar: Story = {
  args: {
    type: "bar",
    variant: "indeterminate",
  },
}

/* ─────────── Determinate Circular ─────────── */
export const DeterminateCircular: Story = {
  args: {
    type: "Circular",
    variant: "determinate",
    value: 80,
    label: "진행중",
  },
}

/* ─────────── Indeterminate Circular ─────────── */
export const IndeterminateCircular: Story = {
  args: {
    type: "Circular",
    variant: "indeterminate",
  },
}

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: () => (
    <Flex align="center" gap="24px">
      <Progress type="Circular" size="24px" />
      <Progress type="Circular" size="36px" />
      <Progress type="Circular" size="48px" />
      <Progress type="Circular" size="64px" />
    </Flex>
  ),
}

/* ─────────── Colors ─────────── */
export const Colors: Story = {
  render: () => (
    <Flex gap="16px" width={"50%"} height={"100vh"} align="center">
      <Progress color={theme.colors.primary[400]} />
      <Progress color={theme.colors.error[500]} />
      <Progress color={theme.colors.success[500]} />
      <Progress color={theme.colors.info[500]} />
    </Flex>
  ),
}

/* ─────────── Label Example ─────────── */
export const WithLabel: Story = {
  args: {
    type: "bar",
    variant: "determinate",
    value: 45,
    label: "45%",
  },
}

/* ─────────── Demo Grid ─────────── */
export const DemoGrid: Story = {
  render: () => (
    <Flex direction="column" gap="24px">
      <Flex gap="24px">
        <Progress type="bar" variant="determinate" value={30} />
        <Progress type="bar" variant="indeterminate" />
      </Flex>

      <Flex gap="24px">
        <Progress type="Circular" variant="determinate" value={70} />
        <Progress type="Circular" variant="indeterminate" />
      </Flex>
    </Flex>
  ),
}
