import type { Meta, StoryObj } from "@storybook/react"
import Progress, { type ProgressProps } from "./Progress"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

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
  },
  argTypes: {
    /* --- Main Props --- */
    type: {
      control: "radio",
      options: ["bar", "Circular"],
      description: "Progress type",
    },
    variant: {
      control: "radio",
      options: ["determinate", "indeterminate"],
      description: "determinate / indeterminate",
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
      description: "track background color",
    },
    height: {
      control: "text",
      description: "bar height",
    },
    size: {
      control: "text",
      description: "Circular size",
    },
    label: { control: "text", description: "progress label" },

    /* --- BaseMixinProps --- */
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
